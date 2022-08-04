import {Snowflake} from "discord-api-types/v10"
import {BaseClient} from "../client/BaseClient.ts"

type TWithID<T> = T & { id?: Snowflake | string }

export interface CacheFetchOptions {
  id: string;
  /**
   * Rest for object
   */
  client: BaseClient;
  /**
   * Returns api object instead of structure
   */
  api?: boolean
}

export class Cache<T = unknown> extends Map<string, T> {
  readonly #limit: number
  constructor (limit = 100) {
    super()

    this.#limit = limit
  }
  set (key: string, value: T) {
    super.set(key, value)

    if (super.size >= this.#limit) {
      this.#removeToLimit()
    }

    return this
  }
  add (item: T, replace = false, id?: string) {
    if (id === undefined) {
      id = (item as TWithID<T>).id
    }

    if (id === undefined || (this.has(id) === true && replace === false)) {
      return item
    }

    this.set(id, item)
    return item
  }
  #removeToLimit () {
    while (super.size >= this.#limit) {
      super.delete(super.keys().next().value)
    }
  }
}
