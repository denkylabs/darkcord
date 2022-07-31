export class Cache<V = unknown> extends Map<string, V> {
  #limit: number
  constructor (limit: number) {
    super()

    this.#limit = limit
  }
  set (key: string, value: V) {
    super.set(key, value)

    if (super.size >= this.#limit) {
      this.#removeToLimit()
    }

    return this
  }
  #removeToLimit () {
    while (super.size >= this.#limit) {
      super.delete(super.keys().next().value)
    }
  }
}
