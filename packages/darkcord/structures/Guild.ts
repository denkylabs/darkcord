import {Base} from "./Base.ts"
import {APIGuild, Snowflake} from "discord-api-types/v10.ts"

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
  readonly afkChannelId: Snowflake | null
  constructor (data: APIGuild) {
    super(data.id)

    this.name = data.name
    this.icon = data.icon
    this.iconHash = data.icon_hash
    this.splash = data.splash
    this.discoverySplash = data.discovery_splash
    this.ownerId = data.owner_id
    this.afkChannelId = data.afk_channel_id
  }
}
