import {BaseClient} from "./BaseClient.ts"
import {GatewayDispatchEvents} from "discord-api-types/v10.ts"
import {Interaction} from "../structures/Interaction.ts"

export class InteractionClient extends BaseClient {
  constructor (publicKey: string) {
    super()
  }
  async connect (port: number) {
    // Creating http server
    const server = Deno.listen({port})

    for await (const conn of server) {
      await this.#serveHttp(conn)
    }
  }
  async #serveHttp (conn: Deno.Conn) {
    const httpConn = Deno.serveHttp(conn)

    for await (const event of httpConn) {
      await this.emit(GatewayDispatchEvents.InteractionCreate, Interaction.from(await event.request.json()))
    }
  }
}
