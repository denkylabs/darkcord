import {Base} from "./Base.ts"
import {APIGuild, Snowflake} from "discord-api-types/v10"
import {RoleCache} from "../cache/RoleCache.ts"
import {BaseClient} from "../client/BaseClient.ts"
import {Permissions} from "./Permissions.ts"
import {Member} from "./Member.ts"
import {MemberCache} from "../cache/MemberCache.ts"
import {StickerCache} from "../cache/StickerCache.ts"
import {ChannelCacheManager} from "../cache/ChannelCache.ts"
import {EmojiCache} from "../cache/EmojiCache.ts"

export class Guild extends Base {
  /**
     * Guild name (2-100 characters, excluding trailing and leading whitespace)
     */
  readonly name: string
  /**
     * Icon hash
     * @See https://discord.com/developers/docs/reference#image-formatting
     */
  readonly icon?: string | null
  /**
     * Icon hash, returned when in the template object
     * @See https://discord.com/developers/docs/reference#image-formatting
     */
  readonly iconHash?: string | null
  /**
     * Splash hash
     * @See https://discord.com/developers/docs/reference#image-formattin
     */
  readonly splash?: string | null
  /**
     * Discovery splash hash; only present for guilds with the “DISCOVERABLE” feature
     * @See https://discord.com/developers/docs/reference#image-formatting
     */
  readonly discoverySplash?: string | null
  /**
     * ID of owner
     */
  readonly ownerId: Snowflake
  /**
   * ID of afk channel
   */
  readonly afkChannelId: Snowflake | null
  /**
   * Afk timeout in seconds
   */
  readonly afkTimeout: number
  /**
   * Banner hash
   * @See https://discord.com/developers/docs/reference#image-formatting
   */
  readonly banner: string | null
  /**
   * The description for the guild
   */
  readonly description: string | null
  /**
   * Roles in the guild
   * @See https://discord.com/developers/docs/topics/permissions#role-object
   */
  readonly roles: RoleCache
  readonly members: MemberCache
  readonly stickers: StickerCache
  readonly channels: ChannelCacheManager
  readonly emojis: EmojiCache
  constructor (public data: APIGuild, public client: BaseClient) {
    super(data.id)

    this.name = data.name
    this.icon = data.icon
    this.iconHash = data.icon_hash
    this.splash = data.splash
    this.discoverySplash = data.discovery_splash
    this.ownerId = data.owner_id
    this.afkChannelId = data.afk_channel_id
    this.afkTimeout = data.afk_timeout
    this.banner = data.banner
    this.description = data.description
    this.roles = client.cache.factory.makeGuildRolesCache()
    this.members = client.cache.factory.makeMembersCache()
    this.stickers = client.cache.factory.makeStickersCache()
    this.channels = client.cache.factory.makeChannelsCacheManager()
    this.emojis = client.cache.factory.makeEmojiCache()
  }
  async permissionsOf (memberId: Snowflake | Member) {
    const member: Member | undefined = memberId instanceof Member ? memberId : await this.members.get(memberId)

    if (!member) {
      throw new Error("Invalid member")
    }

    if (member.user?.id === this.ownerId) {
      return new Permissions(Permissions.All)
    }

    const everyoneRole = await this.roles.get(this.id)
    let permissions = everyoneRole?.permissions.allow

    if (permissions === undefined) {
      return new Permissions(0n)
    }

    if (permissions & Permissions.Flags.Administrator) {
      return new Permissions(Permissions.All)
    }

    for (const _role of await member.roles.keys()) {
      const role = await this.roles.get(_role)

      if (role === undefined) {
        continue
      }

      const {allow} = role.permissions

      if (allow & Permissions.Flags.Administrator) {
        permissions = Permissions.All
        break
      }

      permissions |= allow
    }

    return new Permissions(permissions)
  }
}
