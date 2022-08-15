import {Base} from "./Base.ts"
import {APIUser, UserFlags as Flags, UserPremiumType, LocaleString} from "discord-api-types/v10"
import {BaseClient} from "../client/BaseClient.ts"

export class UserFlags {
  constructor (public rawFlags: Flags) { }
  has (flags: Flags) {
    return (flags & this.rawFlags) === flags
  }
  static Flags = Flags
}
export class User extends Base {
  readonly username: string
  readonly discriminator: string
  readonly avatar: string|null
  readonly isBot?: boolean
  readonly isSystem?: boolean
  readonly mfaEnabled?: boolean
  readonly banner?: string|null
  readonly accentColor?: number|null
  readonly locale?: LocaleString
  readonly nitroType?: UserPremiumType
  readonly publicFlags?: UserFlags
  constructor (data: APIUser, public client: BaseClient) {
    super(data.id)

    this.username = data.username
    this.discriminator = data.discriminator
    this.avatar = data.avatar
    this.isBot = data.bot
    this.isSystem = data.system
    this.mfaEnabled = data.mfa_enabled
    this.banner = data.banner
    this.accentColor = data.accent_color
    this.locale = data.locale as LocaleString
    this.publicFlags = new UserFlags(Number(data.public_flags))
    this.nitroType = data.premium_type
  }
}
