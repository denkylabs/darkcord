import {Cache, CacheFetchOptions} from "./Cache.ts"
import {Guild} from "../structures/Guild.ts"

export class GuildCache extends Cache<Guild> {
  async fetch (options: CacheFetchOptions, useCacheIfExists = false) {
    const {client, id, api} = options

    if (useCacheIfExists && this.has(id)) {
      return this.get(id)
    }

    const data = await client.rest.getGuild(id)

    if (data !== null) {
      if (api) {
        return data
      }

      const b = new Guild(data, client)
      client.cache.guilds.add(b)
      return b
    }

    return null
  }
}
