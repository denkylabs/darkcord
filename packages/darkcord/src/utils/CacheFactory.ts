import { BaseCacheOptions } from "../cache/Cache.ts";
import { ChannelCacheManager } from "../cache/ChannelCache.ts";
import { EmojiCache } from "../cache/EmojiCache.ts";
import { GuildCache } from "../cache/GuildCache.ts";
import { MemberCache } from "../cache/MemberCache.ts";
import { RoleCache } from "../cache/RoleCache.ts";
import { StickerCache } from "../cache/StickerCache.ts";
import { UserCache } from "../cache/UserCache.ts";
import { BaseClient } from "../client/BaseClient.ts";
import { CategoryChannel, TextChannel, VoiceChannel } from "../structures/Channel.ts";
import { Emoji, Reaction } from "../structures/Emoji.ts";
import { Guild } from "../structures/Guild.ts";
import { Member } from "../structures/Member.ts";
import { Role } from "../structures/Role.ts";
import { Sticker } from "../structures/Sticker.ts";
import { User } from "../structures/User.ts";
import { ReactionCache } from "./../cache/ReactionCache.ts";
import { Events } from "./../Events.ts";

export const CacheOff = 0;

export const DefaultCache = 100;

export const DefaultCacheOptions = {
  GuildCache: Infinity
};

export interface CacheFactoryOptions {
    GuildCache?: BaseCacheOptions<Guild> | number;
    GuildMemberCache?: BaseCacheOptions<Member> | number;
    StickerCache?: BaseCacheOptions<Sticker> | number;
    EmojiCache?: BaseCacheOptions<Emoji> | number;
    UserCache?: BaseCacheOptions<User> | number;
    GuildRolesCache?: BaseCacheOptions<Role> | number;
    MemberRolesCache?: BaseCacheOptions<Role> | number;
    EmojiRolesCache?: BaseCacheOptions<Role> | number;
    ReactionCache?: BaseCacheOptions<Reaction> | number;
    GuildChannelCache?: {
      Text?: BaseCacheOptions<TextChannel> | number;
      Voice?: BaseCacheOptions<VoiceChannel> | number;
      Stage?: BaseCacheOptions | number;
      Category?: BaseCacheOptions<CategoryChannel> | number;
    };
    DMChannelCache?: BaseCacheOptions | number;
}

export class CacheFactory {
  options: Readonly<CacheFactoryOptions>;
  constructor (options: CacheFactoryOptions, public client: BaseClient) {
    if (options.GuildCache === CacheOff) {
      this.client.emit(Events.Warn, "Guild Cache is off, this can cause problems");
    }

    this.options = Object.freeze(options);
  }

  makeGuildCache () {
    return new GuildCache(this.options.GuildCache);
  }

  makeMembersCache () {
    return new MemberCache(this.options.GuildMemberCache);
  }

  makeReactionCache () {
    return new ReactionCache(this.options.ReactionCache);
  }

  makeMemberRolesCache () {
    return new RoleCache(this.options.MemberRolesCache);
  }

  makeGuildRolesCache () {
    return new RoleCache(this.options.GuildRolesCache);
  }

  makeUserCache () {
    return new UserCache(this.options.UserCache);
  }

  makeStickersCache () {
    return new StickerCache(this.options.StickerCache);
  }

  makeEmojiRolesCache () {
    return new RoleCache(this.options.EmojiRolesCache);
  }

  makeEmojiCache () {
    return new EmojiCache(this.options.EmojiCache);
  }

  makeChannelsCacheManager () {
    const cache = this.options.GuildChannelCache;

    return new ChannelCacheManager({
      Text: cache?.Text,
      Stage: cache?.Stage,
      Voice: cache?.Voice
    });
  }
}
