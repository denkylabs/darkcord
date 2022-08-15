import { BaseClient } from "../client/BaseClient.ts"

export * from "darkcord/cache"

export interface CacheFetchOptions {
  id: string
  /**
   * Rest for object
   */
  client: BaseClient
  /**
   * Returns api object instead of structure
   */
  api?: boolean
}
