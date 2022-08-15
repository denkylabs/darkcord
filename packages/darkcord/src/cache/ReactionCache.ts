import { Reaction } from "../structures/Emoji.ts";
import { Cache } from "./Cache.ts";

export class ReactionCache extends Cache<Reaction> {
  add(reaction: Reaction, replace = false) {
    return super.add(reaction, replace, (reaction.emoji.id ?? reaction.emoji.name) as string);
  }
}
