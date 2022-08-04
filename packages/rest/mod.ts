export * from "./AsyncBucket.ts"
export * from "./AsyncQueue.ts"
export * from "./RequestHandler.ts"
export * from "./Rest.ts"
export * from "./SequentialBucket.ts"

export abstract class RestAction<T = unknown> {
  _complete: (value: unknown) => Promise<T>
  constructor (complete: (value: unknown) => Promise<T>) {
    this._complete = complete
  }
  abstract complete(important?: boolean): Promise<T>
  abstract queue(important?: boolean): Promise<void>
}
