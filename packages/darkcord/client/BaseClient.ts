import {Rest} from "darkcord/rest"
import EventEmitter from "deno/events"
import {ClientEvents} from "../Events.ts"
import {CacheFactory, CacheFactoryOptions} from "../utils/CacheFactory.ts"

export interface ClientCache<Options = false> {
    factory: Options extends true ? CacheFactoryOptions : CacheFactory
}

export abstract class BaseClient extends EventEmitter {
  rest: Rest
  cache: ClientCache
  protected constructor (cache: ClientCache<true>) {
    super()

    this.rest = new Rest()
    if (cache.factory instanceof CacheFactory) {
      this.cache = cache as unknown as ClientCache<false>
    } else {
      this.cache = {
        factory: new CacheFactory(cache.factory as CacheFactoryOptions, this)
      }
    }
  }
  on<E extends keyof ClientEvents> (event: E, listener: (...args: ClientEvents[E]) => unknown) {
    super.on(event, listener)
    return this
  }
}
