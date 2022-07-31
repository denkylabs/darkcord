import {Snowflake as snowflake} from "discord-api-types/v10.ts"

export class Snowflake extends String {
  constructor (private snowflake: snowflake) {
    super(snowflake)
  }
  getEpoch () {
    return Math.floor(Number(this.snowflake) / 4194304)
  }
  getCreatedAt () {
    return this.getEpoch() + 1420070400000
  }
}
