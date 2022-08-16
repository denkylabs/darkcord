import { APIUnavailableGuild, ApplicationFlags, GatewayIdentifyProperties } from "discord-api-types/v10"
import { Gateway } from "../gateway/Gateway.ts"
import { CacheFactoryOptions, DefaultCacheOptions } from "../utils/CacheFactory.ts"
import { DiscordToken } from "../utils/Utils.ts"
import { BaseClient } from "./BaseClient.ts"
import type { BuilderRequestOptions } from "./ClientBuilder.ts"

export interface GatewayOptions {
  properties?: GatewayIdentifyProperties
  totalShards?: number
  compress?: boolean
}

export interface GatewayClientOptions {
  intents: number
  token: DiscordToken
  cacheFactory: CacheFactoryOptions
  gateway?: GatewayOptions
}

export class GatewayClient extends BaseClient {
  readonly options: GatewayClientOptions

  applicationId?: string

  applicationFlags?: ApplicationFlags

  pendingGuilds: Map<string, APIUnavailableGuild>

  shards: Map<string, Gateway>

  constructor(public token: DiscordToken, public intents: number, cacheFactoryOptions?: CacheFactoryOptions, gatewayOptions?: GatewayOptions, _requestOptions?: BuilderRequestOptions) {
    super(
      {
        factory: cacheFactoryOptions ?? DefaultCacheOptions,
        guilds: undefined,
        users: undefined,
        channels: undefined
      },
      _requestOptions ?? {
        queue: {
          auto: false
        }
      }
    )

    this.pendingGuilds = new Map()
    this.shards = new Map()

    this.options = Object.freeze({
      intents,
      token,
      cacheFactory: cacheFactoryOptions ?? DefaultCacheOptions,
      gateway: gatewayOptions
    })

    this.rest.requestHandler.setToken(this.token)
  }

  getGateway() {
    return this.rest.getGateway()
  }

  async connect() {
    const gateway = await this.getGateway()
    const shardsSize = this.options.gateway?.totalShards ?? gateway.shards

    this.application = await this.rest.getCurrentApplication()
    for (let i = 0; i < shardsSize; i++) {
      const shard = new Gateway(this, {
        shardId: i.toString(),
        compress: this.options.gateway?.compress ?? false,
        encoding: "json"
      })

      this.shards.set(i.toString(), shard)
      await shard.connect()
    }
  }
}
