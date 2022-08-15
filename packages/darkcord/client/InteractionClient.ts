import {BaseClient} from "./BaseClient.ts"
import {GatewayDispatchEvents, InteractionResponseType, InteractionType} from "discord-api-types/v10"
import {Interaction} from "../structures/Interaction.ts"
import * as ed25519 from "ed25519"
import {CacheFactoryOptions} from "../utils/CacheFactory.ts"
import type {BuilderRequestOptions} from "./ClientBuilder.ts"

export class InteractionClient extends BaseClient {
  constructor (
    public publicKey: string,
    token?: string,
    cacheFactoryOptions?: CacheFactoryOptions,
    _requestOptions?: BuilderRequestOptions
  ) {
    super({
      factory: cacheFactoryOptions ?? {
        GuildCache: Infinity
      },
      guilds: undefined,
      users: undefined,
      channels: undefined
    }, _requestOptions ?? {
      queue: {
        auto: false
      }
    })

    if (token !== undefined) {
      super.rest.requestHandler.setToken(token)
    }
  }
  async connect (port: number) {
    // Creating http server
    const server = Deno.listen({port})
    this.application = await this.rest.getCurrentApplication()

    for await (const conn of server) {
      await this.#serveHttp(conn)
    }
  }
  async #serveHttp (conn: Deno.Conn) {
    const httpConn = Deno.serveHttp(conn)
    const decoder = new TextDecoder()

    for await (const event of httpConn) {
      const timestamp = event.request.headers.get("X-Signature-Timestamp") as string
      const signature = event.request.headers.get("X-Signature-Ed25519") as string

      const rawBody = await event.request.arrayBuffer()
      const body = JSON.parse(decoder.decode(rawBody))

      if (!this.#verifyKey(rawBody, signature, timestamp)) {
        throw new RangeError("Invalid verify key")
      }

      if (body.type === InteractionType.Ping) {
        await event.respondWith(new Response(JSON.stringify({
          type: InteractionResponseType.Pong
        })))
        continue
      }

      this.emit(GatewayDispatchEvents.InteractionCreate, Interaction.from(body, this, event.respondWith.bind(event)))
    }
  }
  #toHexUint8Array (value: string) {
    const matches = value.match(/.{1,2}/g)
    const hex = matches?.map((byte: string) => parseInt(byte, 16))
    return new Uint8Array(hex as number[])
  }
  #verifyKey (rawBody: ArrayBuffer, signature: string, timestamp: string) {
    try {
      const encoder = new TextEncoder()
      const bodyData = new Uint8Array(rawBody)
      const timestampData = encoder.encode(timestamp)
      const message = new Uint8Array(timestampData.length + bodyData.length)
      message.set(timestampData)
      message.set(bodyData, timestampData.length)

      const publicKeyData = this.#toHexUint8Array(this.publicKey)
      const signatureData = this.#toHexUint8Array(signature)
      return ed25519.verify(message, signatureData, publicKeyData)
    } catch {
      return false
    }
  }
}
