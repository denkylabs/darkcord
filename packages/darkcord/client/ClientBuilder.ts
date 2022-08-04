import {GatewayClient} from "./GatewayClient.ts"
import {InteractionClient} from "./InteractionClient.ts"
import {GatewayIntentBits} from "discord-api-types/v10"
import {verifyOptions} from "../utils/Options.ts"
import {CacheFactoryOptions} from "../utils/CacheFactory.ts"

type BuiltClient = GatewayClient | InteractionClient
type DiscordToken = `Bot ${string}`

export enum ConnectionType {
    Gateway = 0,
    Interaction = 1
}

export interface ClientOptions {
    type?: ConnectionType;
    intents?: GatewayIntentBits;
    cacheFactory?: CacheFactoryOptions
}

export class ClientBuilder {
  /**
     * Authenticator of this client
     */
  auth: string
  /**
     * Options of this client
     */
  options: ClientOptions
  constructor(publicKey: string, options?: ClientOptions & { token?: DiscordToken })
  constructor (token: DiscordToken, options: ClientOptions = {}) {
    this.auth = token
    if (!options.cacheFactory) {
      options.cacheFactory = {
        GuildCache: Infinity
      }
    }

    this.options = verifyOptions(options)
  }
  /**
     * Set connection type
     * @param type The type of connection
     */
  setType (type: ConnectionType) {
    this.options.type = type
    return this
  }
  setIntents (intents: GatewayIntentBits) {
    this.options.intents = intents
    return this
  }
  setCacheFactory (factory: CacheFactoryOptions) {
    this.options.cacheFactory = factory
    return this
  }
  /**
     * Build the client and returns BuiltClient
     */
  build (): BuiltClient {
    if (this.options.type === ConnectionType.Gateway) {
      return new GatewayClient(this.auth)
    }

    return new InteractionClient(this.auth)
  }
}
