import {APIRole, APIRoleTags, Snowflake} from "discord-api-types/v10.ts"
import {Base} from "./Base.ts"
import {Permissions} from "./Permissions.ts"

export class RoleTags {
  /**
     * The id of the bot this role belongs to
     */
  botId?: Snowflake
  /**
     * The id of the integration this role belongs to
     */
  integrationId?: Snowflake
  /**
     * Whether this is the guild's premium subscriber role
     */
  premiumSubscriber?: null
  constructor (data: APIRoleTags) {
    this.botId = data.bot_id
    this.integrationId = data.integration_id
    this.premiumSubscriber = data.premium_subscriber
  }
}

export class Role extends Base {
  /**
     * Integer representation of hexadecimal color code
     */
  readonly color: number
  /**
     * Role name
     */
  readonly name: string
  /**
     * If this role is pinned in the user listing
     */
  readonly hoist: boolean
  /**
     * Whether this role is managed by an integration
     */
  readonly managed: boolean
  /**
     * Whether this role is mentionable
     */
  readonly mentionable: boolean
  /**
     * Position of this role
     */
  readonly position: number
  /**
     * Permission bit set
     * @See https://en.wikipedia.org/wiki/Bit_field
     */
  readonly permissions: Permissions
  /**
     * The tags this role has
     */
  readonly tags?: RoleTags
  constructor (data: APIRole) {
    super(data.id)

    this.color = data.color
    this.name = data.name
    this.hoist = data.hoist
    this.managed = data.managed
    this.mentionable = data.mentionable
    this.permissions = new Permissions(Number(data.permissions))
    this.position = data.position

    if ("tags" in data) {
      this.tags = new RoleTags(data.tags as APIRoleTags)
    }
  }
}
