import { Rest } from "darkcord/rest";
import EventEmitter from "deno/events";
import { APIApplication } from "discord-api-types/v10";
import { ChannelCacheManager } from "../cache/ChannelCache.ts";
import type { GuildCache } from "../cache/GuildCache.ts";
import type { UserCache } from "../cache/UserCache.ts";
import type { ClientEvents, RawClientEvents } from "../Events.ts";
import { User } from "../structures/User.ts";
import { CacheFactory, type CacheFactoryOptions } from "../utils/CacheFactory.ts";
import { BuilderRequestOptions } from "./ClientBuilder.ts";

export interface ClientCache<Options = false> {
  guilds: Options extends true ? undefined : GuildCache;
  users: Options extends true ? undefined : UserCache;
  channels: Options extends true ? undefined : ChannelCacheManager;
  factory: Options extends true ? CacheFactoryOptions : CacheFactory;
}

export abstract class BaseClient extends EventEmitter {
  rest: Rest;

  cache: ClientCache;

  user?: User;

  application?: APIApplication;

  protected constructor(cache: ClientCache<true>, public _requestOptions: BuilderRequestOptions) {
    super();

    this.rest = new Rest();
    if (cache.factory instanceof CacheFactory) {
      this.cache = cache as unknown as ClientCache<false>;
    } else {
      const factory = new CacheFactory(cache.factory as CacheFactoryOptions, this);
      this.cache = {
        factory,
        users: factory.makeUserCache(),
        guilds: factory.makeGuildCache(),
        channels: factory.makeChannelsCacheManager()
      };
    }
  }
}
export declare interface BaseClient {
  on<E extends keyof (RawClientEvents & ClientEvents)>(event: E, listener: (...args: (RawClientEvents & ClientEvents)[E]) => unknown): this;
  on<E extends keyof RawClientEvents>(event: E, listener: (...args: RawClientEvents[E]) => unknown): this;
  on<E extends keyof ClientEvents>(event: E, listener: (...args: ClientEvents[E]) => unknown): this;

  emit<E extends keyof (RawClientEvents & ClientEvents)>(event: E, ...args: (RawClientEvents & ClientEvents)[E]): boolean;
  emit<E extends keyof RawClientEvents>(event: E, ...args: RawClientEvents[E]): boolean;
  emit<E extends keyof ClientEvents>(event: E, ...args: ClientEvents[E]): boolean;
}
