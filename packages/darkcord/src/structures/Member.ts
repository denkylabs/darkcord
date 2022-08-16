import { APIGuildMember, PartialAPIMessageInteractionGuildMember } from "discord-api-types/v10"
import type { RoleCache } from "../cache/RoleCache.ts"
import { Guild } from "./Guild.ts"
import { Role } from "./Role.ts"
import { User } from "./User.ts"

export class Member {
  /**
   * Whether the user is deafened in voice channels
   */
  readonly deafened: boolean
  /**
   * Whether the user is muted in voice channels
   */
  readonly mute: boolean
  /**
   * Cache of role objects
   */
  readonly roles: RoleCache
  /**
   * The member's guild avatar hash
   */
  readonly avatar?: string | null
  /**
   * This users guild nickname
   */
  readonly nickname?: string | null
  /**
   * Timestamp of when the time out will be removed; until then, they cannot interact with the guild
   */
  readonly communicationDisabledUntil: number | null
  /**
   * Whether the user has not yet passed the guild's Membership Screening requirements
   */
  readonly pending: boolean
  /**
   * When the user joined the guild
   */
  readonly joinedAt: number
  /**
   * The user this guild member represents
   *
   * **This field won't be included in the member object attached to `MESSAGE_CREATE` and `MESSAGE_UPDATE` gateway events.**
   */
  readonly user: User | null

  constructor(data: APIGuildMember | PartialAPIMessageInteractionGuildMember, public readonly guild: Guild) {
    const { communication_disabled_until: communicationDisabledUntil, user } = data as APIGuildMember

    this.avatar = data.avatar

    this.nickname = data.nick

    this.deafened = data.deaf

    this.mute = data.mute

    this.roles = guild.client.cache.factory.makeMemberRolesCache()

    this.communicationDisabledUntil = communicationDisabledUntil !== undefined ? Date.parse(communicationDisabledUntil as string) : null

    this.pending = data.pending ?? false

    this.joinedAt = Date.parse(data.joined_at)

    this.user = user !== undefined ? new User(user, guild.client) : null

    for (const _role of data.roles) {
      const role = guild.roles.get(_role)

      if (role !== undefined) {
        this.roles.add(role as Role)
      }
    }
  }

  get permissions() {
    return Object.freeze(this.guild.permissionsOf(this.user?.id as string))
  }
}
