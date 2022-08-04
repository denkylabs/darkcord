import {ReactionCache} from "./../cache/ReactionCache.ts"
import {Events} from "./../Events.ts"
import {BaseClient} from "../client/BaseClient.ts"
import {GuildCache} from "../cache/GuildCache.ts"
import {RoleCache} from "../cache/RoleCache.ts"
import {MemberCache} from "../cache/MemberCache.ts"

export const CacheOff = 0
export const DefaultCache = 100

export interface CacheFactoryOptions {
    GuildCache: number;
    GuildMemberCache?: number;
    StickerCache?: number;
    EmojiCache?: number;
    UserCache?: number;
    GuildRolesCache?: number;
    MemberRolesCache?: number;
    EmojiRolesCache?: number;
    ReactionCache?: number;
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
      this.client.emit(Events.Warn, "Guild Cache is off, this can cause problems")
    }

    this.options = Object.freeze(options)
  }
  makeGuildCache () {
    return new GuildCache(this.options.GuildCache)
  }
  makeMembersCache () {
    return new MemberCache(this.options.GuildMemberCache)
  }
  makeReactionCache () {
    return new ReactionCache(this.options.ReactionCache)
  }
  makeMemberRolesCache () {
    return new RoleCache(this.options.MemberRolesCache)
  }
  makeGuildRolesCache () {
    return new RoleCache(this.options.GuildRolesCache)
  }
  makeEmojiRolesCache () {
    return new RoleCache(this.options.EmojiRolesCache)
  }
}
