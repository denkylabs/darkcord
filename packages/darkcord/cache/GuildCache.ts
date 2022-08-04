import {Cache} from "../Cache.ts"
import {Guild} from "../structures/Guild.ts"

export class GuildCache extends Cache<Guild> {
  add (guild: Guild, replace = false) {
    const id = guild.id.toString()
    if (super.has(id) && !replace) {
      return super.get(id)
    }

    super.set(id, guild)
    return guild
  }
}
