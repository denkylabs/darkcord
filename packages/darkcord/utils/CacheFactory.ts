import {BaseClient} from "../client/BaseClient.ts"

export const CacheOff = 0
export const DefaultCache = 100

export interface CacheFactoryOptions {
    GuildCache: number;
    GuildMemberCache?: number;
    StickerCache?: number;
    EmojiCache?: number;
    UserCache?: number;
    GuildChannelCache?: {
        Text?: number;
        Voice?: number;
        Stage?: number;
    };
    DMChannelCache?: number;
}

export class CacheFactory {
  options: Readonly<CacheFactoryOptions>
  constructor (
    options: CacheFactoryOptions,
        public client: BaseClient
  ) {
    if (options.GuildCache === CacheOff) {
      this.client.emit("WARN", "Guild Cache is off, this can cause problems").then()
    }

    this.options = Object.freeze(options)
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  makeGuildCache () {

  }
}
