/* eslint-disable @typescript-eslint/no-explicit-any */
export * from "./src/AsyncBucket.ts"
export * from "./src/AsyncQueue.ts"
export * from "./src/RequestHandler.ts"
export * from "./src/Rest.ts"
export * from "./src/SequentialBucket.ts"

export interface RestActionQueueOptions {
  sendIn?: number
  isImportant?: boolean
}

export interface RestActionCompleteOptions extends RestActionQueueOptions {
  returnApiObject?: boolean
}

export abstract class RestAction<Data> {
  _complete: (value: any) => Promise<Data>
  constructor(complete: (value: any) => Promise<Data>) {
    this._complete = complete
  }

  /**
   * Complete request, add to queue and return structure
   * @param important If this request is important
   * @returns structure
   */
  abstract complete(options: RestActionCompleteOptions): Promise<any>
  /**
   * Complete request and add to queue
   * @param important If this request is important
   */
  abstract queue(options: RestActionQueueOptions): Promise<void>
}
