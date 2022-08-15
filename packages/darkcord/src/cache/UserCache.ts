import { User } from "../structures/User.ts";
import { Cache, CacheFetchOptions } from "./Cache.ts";

export class UserCache extends Cache<User> {
  async fetch(options: CacheFetchOptions, useCacheIfExists = false) {
    const { client, id, api } = options;

    if (useCacheIfExists && this.has(id)) {
      return this.get(id);
    }

    const data = await client.rest.getUser(id);

    if (data !== null) {
      if (api) {
        return data;
      }

      const b = new User(data, client);
      await client.cache.users.add(b, true);
      return b;
    }

    return null;
  }
}
