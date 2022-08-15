/* eslint-disable @typescript-eslint/no-explicit-any */
export * from "./AsyncBucket.ts"
export * from "./AsyncQueue.ts"
export * from "./RequestHandler.ts"
export * from "./Rest.ts"
export * from "./SequentialBucket.ts"

export interface RestActionQueueOptions {
  sendIn?: number;
  isImportant?: boolean;
}

export interface RestActionCompleteOptions extends RestActionQueueOptions {
  returnApiObject?: boolean
}

export abstract class RestAction<Data> {
  _complete: (value: any) => Promise<Data>
  constructor (complete: (value: any) => Promise<Data>) {
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
