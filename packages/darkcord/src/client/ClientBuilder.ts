import { GatewayIntentBits } from "discord-api-types/v10";
import type { CacheAdapter } from "../cache/Cache.ts";
import type { CacheFactoryOptions } from "../utils/CacheFactory.ts";
import { verifyOptions } from "../utils/Options.ts";
import { DefaultIntents, type DiscordToken } from "../utils/Utils.ts";
import { GatewayClient, type GatewayOptions } from "./GatewayClient.ts";
import { InteractionClient } from "./InteractionClient.ts";

export enum ConnectionType {
  Gateway = 0,
  Interaction = 1
}

export enum QueueMode {
  Normal = 0,
  Complete = 1,
  ApiObjects = 2
}

export interface BuilderRequestOptions {
  queue: {
    auto: boolean;
    /**
     * Only if the options auto is true
     */
    mode?: QueueMode;
  };
}

export interface ClientOptions<T extends ConnectionType> {
  type?: T;
  intents?: GatewayIntentBits;
  cacheFactory?: CacheFactoryOptions & { adapter?: CacheAdapter<unknown> };
  gateway?: GatewayOptions;
  requests?: BuilderRequestOptions;
}

export class ClientBuilder<T extends ConnectionType> {
  /**
   * Authenticator of this client
   */
  auth: string;

  /**
   * Options of this client
   */
  options: ClientOptions<T>;

  constructor(publicKey: string, options?: ClientOptions<ConnectionType.Interaction> & { token?: DiscordToken });

  constructor(token: DiscordToken, options?: ClientOptions<ConnectionType.Gateway>);

  constructor(token: DiscordToken, options: ClientOptions<T> = {}) {
    this.auth = token;
    if (!options.cacheFactory) {
      options.cacheFactory = {
        GuildCache: Infinity
      };
    }

    this.options = verifyOptions(options) as ClientOptions<T>;
    if (options.intents === undefined) {
      this.options.intents = DefaultIntents;
    }
  }

  /**
   * Set connection type
   * @param type The type of connection
   */
  setType(type: T) {
    this.options.type = type;
    return this;
  }

  setIntents(intents: GatewayIntentBits) {
    this.options.intents = intents;
    return this;
  }

  setCacheFactory(factory: CacheFactoryOptions) {
    this.options.cacheFactory = factory;
    return this;
  }

  /**
   * Build the client and returns BuiltClient
   */
  build() {
    if (this.options.type === ConnectionType.Gateway) {
      return new GatewayClient(this.auth as DiscordToken, this.options.intents as number, this.options.cacheFactory, this.options.gateway, this.options.requests);
    }

    return new InteractionClient(this.auth, (this.options as ClientOptions<T> & { token?: DiscordToken }).token, this.options.cacheFactory, this.options.requests);
  }
}
