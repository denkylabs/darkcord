import {
  APIEmoji,
  Snowflake,
  APIReaction
} from "discord-api-types/v10"
import {Guild} from "./Guild.ts"
import {RoleCache} from "../cache/RoleCache.ts"

export class Emoji {
  readonly name: string | null
  readonly id: Snowflake | null
  readonly animated: boolean
  readonly managed: boolean
  readonly available?: boolean | null
  readonly requireColons?: boolean
  readonly roles: RoleCache
  readonly user: any
  constructor (data: APIEmoji, guild?: Guild) {
    this.name = data.name
    this.id = data.id
    this.animated = data.animated ?? false
    this.managed = data.managed ?? false
    this.available = data.available
    this.requireColons = data.require_colons
    this.roles = guild?.client.cache.factory.makeEmojiRolesCache() ?? new RoleCache()

    if (guild && data.roles) {
      for (const _role of data.roles) {
        const role = guild.roles.get(_role)

        if (role !== undefined) {
          this.roles.add(role)
        }
      }
    }

    this.user = data.user
  }
}

export class Reaction {
  /**
   * Times this emoji has been used to react
   */
  count: number
  /**
   * Emoji object
   */
  emoji: Emoji
  /**
   * Whether the current client reacted using this emoji
   */
  me: boolean
  constructor (data: APIReaction) {
    this.count = data.count
    this.emoji = new Emoji(data.emoji)
    this.me = data.me
  }
}
