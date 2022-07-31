import {Snowflake as snowflake} from "discord-api-types/v10.ts"
import {Snowflake} from "./Snowflake.ts"

export class Base {
  createdAt: number
  id: Snowflake
  constructor (id: snowflake) {
    this.id = new Snowflake(id)
    this.createdAt = this.id.getCreatedAt()
  }
}
