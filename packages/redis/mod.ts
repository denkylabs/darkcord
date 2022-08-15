import { CacheAdapter } from "darkcord/cache"
import * as redis from "redis"

/**
 * @example
 * ```js
 * import {RedisCacheAdapter} from "darkcord@redis"
 * import {ClientBuilder} from "darkcord@client"
 *
 * (async () => {
 *  const adapter = new RedisCacheAdapter()
 *  await adapter.connect({hostname: "redis hostname"})
 *
 *  const client = new ClientBuilder("Bot token", {
 *    cacheFactory: {
 *      adapter
 *    }
 *  }).build()
 *
 *
 * client.on("READY", () => {
 *   console.log(await client.cache.users.get("id"))
 * })
 *
 * await client.connect()
 * })()
 * ```
 */
export class RedisCacheAdapter<T> implements CacheAdapter<T> {
  #instance!: redis.Redis
  async connect (options: redis.RedisConnectOptions) {
    this.#instance = await redis.connect(options)
    return this.instance
  }

  async set (key: string, value: T) {
    await this.instance.set(key, JSON.stringify(value))
    return this as unknown as CacheAdapter<T>
  }

  async get (key: string) {
    const result = await this.instance.hget("darkcord", key)

    if (result !== undefined) {
      return JSON.parse(result)
    }

    return null
  }

  async has (key: string) {
    return !!await this.instance.exists(key)
  }

  async entries () {
    const arr = await this.instance.hgetall("darkcord")
    const result = arr.map(async (value) => [value, this.#resolveValue(await this.instance.hget("darkcord", value))])
    return (async function * () {
      for await (const [key, value] of result) {
        yield [key, value]
      }
    })() as unknown as Promise<IterableIterator<[string, T]>>
  }

  get size () {
    return this._getSize()
  }

  _getSize () {
    return this.instance.hlen("darkcord")
  }

  delete (key: string) {
    return !!this.instance.hdel("darkcord", key)
  }

  async clear () {
    await this.instance.flushall()
  }

  async values () {
    const arr = await this.instance.hgetall("darkcord")
    const result = arr.map(async (value) => this.#resolveValue(await this.instance.hget("darkcord", value)))
    return (async function * () {
      for await (const value of result) {
        yield value
      }
    })() as unknown as Promise<IterableIterator<T>>
  }

  async keys () {
    const result = await this.instance.hgetall("darkcord")
    return (async function * () {
      for await (const value of result) {
        yield value
      }
    })() as unknown as Promise<IterableIterator<string>>
  }

  #resolveValue (value: redis.Bulk) {
    try {
      const json = JSON.parse(value as string)
      return json
    } catch {
      return value
    }
  }

  get instance () {
    if (this.#instance === undefined) {
      throw new Error("Missing redis connection, please connect first.")
    }

    return this.#instance
  }
}
