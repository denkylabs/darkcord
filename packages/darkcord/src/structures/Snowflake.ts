import { Snowflake as snowflake } from "discord-api-types/v10";

export class Snowflake extends String {
  constructor(private snowflake: snowflake) {
    super(snowflake);
  }

  getEpoch() {
    return Snowflake.getEpoch(this.snowflake);
  }

  getCreatedAt() {
    return Snowflake.getCreatedAt(this.snowflake);
  }

  static getEpoch(snowflake: snowflake) {
    return Math.floor(Number(snowflake) / 4194304);
  }

  static getCreatedAt(snowflake: snowflake) {
    return this.getEpoch(snowflake) + 1420070400000;
  }
}
