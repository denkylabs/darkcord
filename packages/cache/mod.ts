/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Snowflake} from "discord-api-types/v10"

export interface BaseCacheSweeper<T> {
    lifetime?: number;
    filter?: (value: T) => boolean;
    keepFilter?: (value: T) => boolean;
}

export interface BaseCacheOptions<T = unknown> {
    maxSize: number;
    sweeper?: BaseCacheSweeper<T>;
}

type Awaitable<T> = T | Promise<T>
type TWithID<T> = T & { id?: Snowflake | string }

export interface CacheAdapter<T> {
  set(key: string, value: T): Awaitable<CacheAdapter<T>>
  get(key: string): Awaitable<T | undefined>
  delete(key: string): Awaitable<boolean>
  clear(): Awaitable<void>
  entries(): Awaitable<IterableIterator<[string, T]>>
  values(): Awaitable<IterableIterator<T>>
  keys(): Awaitable<IterableIterator<string>>
  _getSize(): Awaitable<number>
  has(key: string): Awaitable<boolean>
  size: Awaitable<number>
}

/**
 * Asynchronous or not Cache
 */
export class Cache<T = unknown> {
  readonly #limit: number
  readonly #sweeper?: BaseCacheSweeper<T>
  // eslint-disable-next-line no-use-before-define
  _set: (key: string, value: T) => Awaitable<CacheAdapter<T>>
  delete: (key: string) => Awaitable<boolean>
  entries: () => Awaitable<IterableIterator<[string, T]>>
  clear: () => Awaitable<void>
  #map?: Map<string, T>
  get: (key: string) => Awaitable<T | undefined>
  values: () => Awaitable<IterableIterator<T>>
  _getSize: () => Awaitable<number>
  keys: () => Awaitable<IterableIterator<string>>
  has: (key: string) => Awaitable<boolean>
  constructor(limit?: BaseCacheOptions<T> | number, adapter?: CacheAdapter<T>)
  constructor(limit: number)
  constructor(options: BaseCacheOptions<T>)
  constructor (limit: BaseCacheOptions<T> | number = 100, adapter?: CacheAdapter<T>) {
    if (typeof limit === "object") {
      this.#limit = limit.maxSize
      this.#sweeper = limit.sweeper as unknown as BaseCacheSweeper<T>
    } else {
      this.#limit = limit as number
    }

    // Configuring adapter
    if (adapter === undefined) {
      this.#map = new Map()
    }

    this._set = adapter?.set ?? ((key, value) => {
      this.#map?.set(key, value)
      return this as CacheAdapter<T>
    })
    this.get = adapter?.get.bind(adapter) ?? this.#map!.get.bind(this.#map)
    this.delete = adapter?.delete.bind(adapter) ?? this.#map!.delete.bind(this.#map)
    this.clear = adapter?.clear.bind(adapter) ?? this.#map!.clear.bind(this.#map)
    this.entries = adapter?.entries.bind(adapter) ?? this.#map!.entries.bind(this.#map)
    this.values = adapter?.values.bind(adapter) ?? this.#map!.values.bind(this.#map)
    this.keys = adapter?.keys.bind(adapter) ?? this.#map!.keys.bind(this.#map)
    this.has = adapter?.has.bind(adapter) ?? this.#map!.has.bind(this.#map)
    this._getSize = adapter?._getSize ?? (() => this.#map?.size as number)
  }
  get size (): number | Promise<number> {
    return this._getSize()
  }
  get extender (): new () => Cache<T> {
    return (this.constructor as unknown as {
      [Symbol.species]: typeof Cache
    })[Symbol.species]
  }
  async filter (filter: (value: T, key: string) => boolean) {
    // eslint-disable-next-line new-cap
    const cache = new this.extender() as Cache<T>

    await this.forEach(async (value, key) => {
      if (filter(value, key) === true) {
        await cache.set(key, value)
      }
    })

    return cache
  }
  async forEach (fn: (value: T, key: string) => void) {
    for (const [key, value] of await this.entries()) {
      fn(value, key)
    }
  }
  async find (findFn: (value: T, key: string) => boolean) {
    for (const [key, value] of await this.entries()) {
      if (findFn(value, key) === true) {
        return value
      }
    }
  }
  async reduce<I> (reduceFn: (accumulator: I, value: T, key: string) => I, initialValue?: I) {
    let accumulator = initialValue as I
    let first = false

    if (accumulator === undefined) {
      if (this.size === 0) {
        throw new TypeError("Reduce of empty cache with no initial value")
      }

      first = true
    }

    await this.forEach((value, key) => {
      if (first === true) {
        accumulator = value as unknown as I
        first = false
      }

      accumulator = reduceFn(accumulator, value, key)
    })

    return accumulator
  }
  async set (key: string, value: T) {
    if (this.#sweeper?.filter !== undefined && this.#sweeper.filter(value) === false) {
      return this
    }

    await this._set(key, value)

    if (this.#sweeper?.lifetime) {
      setTimeout(() => this.delete(key), this.#sweeper.lifetime)
    }

    if (this.size >= this.#limit && !this.#sweeper?.keepFilter?.(value)) {
      this.#removeToLimit()
    }

    return this
  }
  async add (item: T, replace = false, id?: string) {
    if (id === undefined) {
      id = (item as TWithID<T>).id
    }

    if (id === undefined || (this.has(id) === true && replace === false)) {
      return item
    }

    await this.set(id, item)
    return item
  }
  async #removeToLimit () {
    const keys = await this.keys()

    while (this.size >= this.#limit) {
      const key = keys.next().value as string
      const value = this.get(key)

      if (this.#sweeper?.keepFilter?.(value as T)) {
        continue
      }

      this.delete(key)
    }
  }
}
