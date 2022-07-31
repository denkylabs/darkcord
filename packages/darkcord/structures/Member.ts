import {APIGuildMember} from "discord-api-types/v10.ts"
import {BaseClient} from "../client/BaseClient.ts"

export class Member {
  readonly deaf: boolean
  readonly mute: boolean
  readonly roles: any
  constructor (data: APIGuildMember, client: BaseClient) {
    this.deaf = data.deaf
    this.mute = data.mute
    this.roles = data.roles
  }
}
