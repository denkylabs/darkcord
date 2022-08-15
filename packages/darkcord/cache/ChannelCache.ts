import {CategoryChannel, Channel, TextChannel, VoiceChannel} from "../structures/Channel.ts"
import {Cache} from "./Cache.ts"
import {ChannelType} from "discord-api-types/v10"
import {BaseCacheOptions} from "../utils/CacheFactory.ts"

export interface ChannelCacheLimits {
    Text?: BaseCacheOptions<TextChannel> | number;
    Voice?: BaseCacheOptions<VoiceChannel> | number;
    Stage?: BaseCacheOptions | number;
    Category?: BaseCacheOptions<CategoryChannel> | number;
    Thread?: BaseCacheOptions | number;
}

export class TextChannelCache extends Cache<TextChannel> {}
export class VoiceChannelCache extends Cache<VoiceChannel> { }
export class CategoryChannelCache extends Cache<CategoryChannel> { }

export class ChannelCacheManager {
  #limits: ChannelCacheLimits
  Text: TextChannelCache
  Voice: VoiceChannelCache
  Category: CategoryChannelCache
  /**
     * @param limits If this is number, apply to all channels cache
     */
  constructor (limits: ChannelCacheLimits | number = Infinity) {
    if (typeof limits === "number") {
      this.#limits = {
        Text: limits,
        Voice: limits,
        Stage: limits,
        Category: limits,
        Thread: limits
      }
    } else {
      this.#limits = limits
    }

    this.Text = new TextChannelCache(this.#limits.Text)
    this.Voice = new VoiceChannelCache(this.#limits.Voice)
    this.Category = new CategoryChannelCache(this.#limits.Category)
  }
  add (channel: Channel, replace = false, id?: string) {
    const add = ({
      [ChannelType.GuildText]: () => this.Text.add(channel as TextChannel, replace, id),
      [ChannelType.GuildVoice]: () => this.Voice.add(channel as VoiceChannel, replace, id),
      [ChannelType.GuildCategory]: () => this.Category.add(channel as CategoryChannel, replace, id)
    })[channel.type as number]

    if (add === undefined) {
      throw new Error(`No channel cache available for channel type: ${channel.type}`)
    }

    return add()
  }
  get (id: string) {
    return this.Text.get(id) ?? this.Voice.get(id) ?? this.Category.get(id)
  }
}
