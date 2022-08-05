import {AsyncBucket as Bucket} from "./AsyncBucket.ts"
import {Rest} from "./Rest.ts"
import {SequentialBucket} from "./SequentialBucket.ts"
import {DiscordAPIError, RequestError} from "./utils/error.ts"
import {parse} from "./utils/parse.ts"
import {ApiVersion, DiscordUrl, ApiRoute} from "./utils/utils.ts"
import {delay} from "deno/async"
export interface RequestHeaders {
    Authorization?: string;
    "User-Agent": string;
    "X-Audit-Log-Reason"?: string;
    "Content-Type": string
}

interface RequestHandlerOptions {
  token?: string
  apiVersion?: string
  maxRetry?: number
}

function getAPIOffset (serverDate: Date) {
  return serverDate.getTime() - Date.now()
}

function calculateReset (reset: string, serverDate: Date) {
  return new Date(Number(reset) * 1000).getTime() - getAPIOffset(serverDate)
}

export class RequestHandler {
  auth: string | undefined
  #apiRoute: string
  #maxRetry: number
  #buckets: SequentialBucket
  constructor (public rest: Rest, options: RequestHandlerOptions = {}) {
    this.auth = options.token
    this.#apiRoute = DiscordUrl + ApiRoute + (options.apiVersion || ApiVersion)
    this.#maxRetry = options.maxRetry || 5
    this.#buckets = new SequentialBucket(rest)
  }
  setToken (token: string) {
    this.auth = token
    return this
  }
  get (router: string) {
    return this.#request(router)
  }
  patch (router: string, body?: BodyInit, contentType?: string) {
    return this.#request(router, "PATCH", body, contentType)
  }
  put (router: string, body?: BodyInit, contentType?: string) {
    return this.#request(router, "PUT", body, contentType)
  }
  post (router: string, body?: BodyInit, contentType?: string) {
    return this.#request(router, "POST", body, contentType)
  }
  delete (router: string) {
    return this.#request(router, "DELETE")
  }
  #globalDelayFor (ms: number) {
    return new Promise<void>(resolve => {
      this.#buckets.setTimeout(() => {
        this.#buckets.globalDelay = null
        resolve()
      }, ms)
    })
  }
  #request (router: string, method = "GET", body?: BodyInit, reason?: string, contentType = "application/json"): Promise<unknown | null> {
    let bucket: Bucket | undefined
    let retries = 1
    const {auth, rest} = this
    const maxRetry = this.#maxRetry
    const buckets = this.#buckets
    const globalDelayFor = this.#globalDelayFor.bind(this)
    router = this.#apiRoute + router

    const headers = {
      Authorization: auth,
      "User-Agent": "DiscordBot (https://github.com/denkylabs/darkcord, v0.1.0)",
      "Content-Type": contentType
    } as RequestHeaders

    if (reason) {
      headers["X-Audit-Log-Reason"] = encodeURIComponent(reason)
    }

    function emitRateLimit (global: boolean, timeout: number, limit: number) {
      rest.emit("rateLimit", {
        global,
        timeout,
        limit,
        router,
        method
      })
    }

    async function request (): Promise<unknown> {
      if (bucket) {
        while (buckets.limited || bucket.limited) {
          const isGlobal = buckets.limited
          let limit, timeout, delayPromise

          if (isGlobal) {
            limit = buckets.globalLimit
            timeout = Number(buckets.globalReset) + buckets.restTimeOffset - Date.now()

            if (typeof buckets.globalDelay !== "number") {
              buckets.globalDelay = globalDelayFor(timeout)
            }

            delayPromise = buckets.globalDelay
          } else {
            limit = bucket.limit
            timeout = bucket.reset + buckets.restTimeOffset - Date.now()
            delayPromise = delay(timeout)
          }

          emitRateLimit(isGlobal, timeout, limit)
          await delayPromise
        }
      }

      const res = await fetch(router, {
        body,
        method,
        headers: headers as unknown as HeadersInit
      })

      const _serverDate = res.headers.get("date") as string
      const _limit = res.headers.get("x-ratelimit-limit")
      const _remaining = res.headers.get("x-ratelimit-remaining")
      const _reset = res.headers.get("x-ratelimit-reset")

      let sublimitTimeout
      const serverDate = new Date(_serverDate)
      const limit = _limit ? Number(_limit) : Infinity
      const remaining = _remaining ? Number(_remaining) : 1
      let reset = _reset ? calculateReset(_reset, serverDate) : Date.now()
      let retryAfter: number | null | string = res.headers.get("retry-after")
      retryAfter = retryAfter ? Number(retryAfter) * 1000 : -1

      if (router.includes("reactions") === true) {
        reset =
          serverDate.getTime() - getAPIOffset(serverDate) + 250
      }

      // Get router bucket
      if (bucket === undefined) {
        bucket = buckets.get(router) ?? buckets.add(router, new Bucket(limit, remaining, reset))
      }

      if (retryAfter > 0) {
        if (res.headers.get("x-ratelimit-global")) {
          buckets.globalRemaining = 0
          buckets.globalReset = Date.now() + retryAfter
        } else if (!bucket?.limited) {
          sublimitTimeout = retryAfter
        }
      }

      if (res.ok === true) {
        if (method === "DELETE") {
          // Remove bucket from cache
          buckets.remove(router)
        }

        return parse(res)
      }

      if (res.status >= 400 && res.status < 500) {
        if (res.status === 429) {
          rest.emit("warn", `Rate-Limit on route ${router}${sublimitTimeout !== undefined ? " for sublimit" : ""}`)

          if (sublimitTimeout !== undefined) {
            await delay(sublimitTimeout)
          }
        }
        let data
        try {
          data = await parse(res)
        } catch (err) {
          const _ = err as RequestError
          throw new RequestError(
            router,
            method,
            _.message,
            _.constructor.name,
            _.code
          )
        }

        throw new DiscordAPIError(
          router,
          method,
          data?.code,
          data?.errors
        )
      }

      if (res.status >= 500 && res.status < 600) {
        if (retries === maxRetry) {
          throw new RequestError(router, method, res.statusText, "APIRequest", res.status)
        }

        retries++
        return request()
      }

      return null
    }

    return request()
  }
}
