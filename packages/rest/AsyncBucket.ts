import {AsyncQueue} from "./AsyncQueue.ts"

export class AsyncBucket {
  queue: AsyncQueue
  constructor (public limit: number, public remaining: number, public reset: number) {
    this.queue = new AsyncQueue()
  }
  get limited () {
    return this.remaining <= 0 && Date.now() < this.reset
  }
  get inactive () {
    return this.queue.remaining === 0 && !this.limited
  }
}
