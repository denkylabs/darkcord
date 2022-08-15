import { APIEmoji, APIReaction, Snowflake } from "discord-api-types/v10";
import { RoleCache } from "../cache/RoleCache.ts";
import type { BaseClient } from "../client/BaseClient.ts";
import { Guild } from "./Guild.ts";
import { User } from "./User.ts";

export class Emoji {
  readonly name: string | null;
  readonly id: Snowflake | null;
  readonly animated: boolean;
  readonly managed: boolean;
  readonly available?: boolean | null;
  readonly requireColons?: boolean;
  readonly roles: RoleCache;
  readonly user: User | null;

  constructor(public data: APIEmoji, client: BaseClient, public guild?: Guild) {
    this.name = data.name;

    this.id = data.id;

    this.animated = data.animated ?? false;

    this.managed = data.managed ?? false;

    this.available = data.available;

    this.requireColons = data.require_colons;

    this.roles = client.cache.factory.makeEmojiRolesCache();

    this.user = data.user ? new User(data.user, client) : null;
  }
}

export class Reaction {
  /**
   * Times this emoji has been used to react
   */
  count: number;
  /**
   * Emoji object
   */
  emoji: Emoji;
  /**
   * Whether the current client reacted using this emoji
   */
  me: boolean;

  constructor(public data: APIReaction, public client: BaseClient) {
    this.count = data.count;

    this.emoji = new Emoji(data.emoji, client);

    this.me = data.me;
  }
}
