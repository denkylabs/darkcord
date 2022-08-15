import { Snowflake as snowflake } from "discord-api-types/v10";
import { Snowflake } from "./Snowflake.ts";

export class Base {
  createdAt: number;

  constructor (public id: snowflake) {
    this.createdAt = Snowflake.getCreatedAt(id);
  }
}
