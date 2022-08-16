import { APIChannel, APIGuildCategoryChannel, APITextChannel, APIVoiceChannel, ChannelFlags as Flags, ChannelType, VideoQualityMode } from "discord-api-types/v10"
import { BaseClient } from "../client/BaseClient.ts"
import { QueueMode } from "../client/ClientBuilder.ts"
import { TextChannelCreateMessageRestAction } from "./actions/TextChannel.ts"
import { Base } from "./Base.ts"
import { BitField } from "./BitField.ts"
import { MessagePostData } from "./Message.ts"

export class ChannelFlags extends BitField<Flags, typeof Flags> {
  constructor(flags: Flags) {
    super(flags, Flags)
  }

  static Flags = Flags
}

export class Channel extends Base {
  /**
   * The type of the channel
   *
   * @See https://discord.com/developers/docs/resources/channel#channel-object-channel-types
   */
  readonly type: ChannelType
  /**
   * The name of the channel (2-100 characters)
   */
  readonly name: string | null
  /**
   * The flags of the channel
   */
  readonly flags: ChannelFlags | null
  constructor(data: APIChannel) {
    super(data.id)

    const { flags, name } = data
    this.type = data.type
    this.name = typeof name === "string" ? name : null
    this.flags = flags !== undefined ? new ChannelFlags(data.flags as Flags) : null
  }

  static from(channel: APIChannel, client: BaseClient) {
    switch (channel.type) {
      case ChannelType.GuildText: {
        return new TextChannel(channel, client)
      }
      default: {
        return new Channel(channel)
      }
    }
  }
}

export class TextChannel extends Channel {
  /**
     * ID of the parent category for a channel (each parent category can contain up to 50 channels)
     *
     * OR
     *
     * ID of the parent channel for a thread

     */
  parentId?: string | null
  /**
   * The channel topic (0-1024 characters)
   */
  topic?: string | null
  /**
   * Sorting position of the channel
   */
  position?: number
  /**
   * Whether the channel is nsfw
   */
  isNsfw: boolean
  /**
   * The id of the last message sent in this channel (may not point to an existing or valid message)
   */
  lastMessageId?: string | null
  /**
   * Amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `MANAGE_MESSAGES` or `MANAGE_CHANNELS`, are unaffected
   *
   * `rateLimitPerUser` also applies to thread creation. Users can send one message and create one thread during each `rateLimitPerUser` interval.
   *
   * For thread channels, `rateLimitPerUser` is only returned if the field is set to a non-zero and non-null value. The absence of this field in API calls and Gateway events should indicate that slowmode has been reset to the default value.
   */
  rateLimitPerUser?: number
  /**
   * When the last pinned message was pinned. This may be `null` in events such as `GUILD_CREATE` when a message is not pinned
   */
  lastPinnedMessage?: string | null
  constructor(public data: APITextChannel, public client: BaseClient) {
    super(data)

    const { nsfw } = data
    this.parentId = data.parent_id
    this.topic = data.topic
    this.position = data.position
    this.isNsfw = nsfw !== undefined ? nsfw : false
    this.lastMessageId = data.last_message_id
    this.rateLimitPerUser = data.rate_limit_per_user
    this.lastPinnedMessage = data.last_pin_timestamp
  }

  /**
   * Send's message to this channel
   * @param data The message post data
   * @returns
   */
  send(data: MessagePostData) {
    const { queue } = this.client._requestOptions
    const action = new TextChannelCreateMessageRestAction(data, this, d => {
      return this.client.rest.createMessage(this.id, d, d.files)
    })

    if (queue.auto === true) {
      return queue.mode === QueueMode.Normal ? action.queue() : action.complete({ returnApiObject: queue.mode === QueueMode.ApiObjects })
    }

    return action
  }
}

export class VoiceChannel extends Channel {
  /**
   * The bitrate (in bits) of the voice channel
   */
  bitrate?: number
  /**
   * The id of the guild (may be missing for some channel objects received over gateway guild dispatches)
   */
  guildId?: string
  /**
   * Sorting position of the channel
   */
  position?: number
  /**
   * Whether the channel is nsfw
   */
  nsfw: boolean
  /**
   * Voice region id for the voice or stage channel, automatic when set to null
   *
   * @See https://discord.com/developers/docs/resources/voice#voice-region-object
   */
  rtcRegion?: string | null
  /**
   * The user limit of the voice channel
   */
  userLimit?: number
  /**
   * The user limit of the voice channel
   */
  videoQualityMode?: VideoQualityMode
  /**
   * ID of the parent category for a channel (each parent category can contain up to 50 channels)
   */
  parentId?: string | null
  constructor(public data: APIVoiceChannel, public client: BaseClient) {
    super(data)

    this.bitrate = data.bitrate
    this.guildId = data.guild_id
    this.position = data.position
    this.nsfw = data.nsfw ?? false
    this.rtcRegion = data.rtc_region
    this.userLimit = data.user_limit
    this.videoQualityMode = data.video_quality_mode
    this.parentId = data.parent_id
  }
}

export class CategoryChannel extends Channel {
  /**
   * The id of the guild (may be missing for some channel objects received over gateway guild dispatches)
   */
  guildId?: string
  /**
   * ID of the parent category for a channel (each parent category can contain up to 50 channels)
   */
  parentId?: string | null
  /**
   * Sorting position of the channel
   */
  position?: number
  constructor(public data: APIGuildCategoryChannel, public client: BaseClient) {
    super(data)
    this.guildId = data.guild_id
    this.parentId = data.parent_id
    this.position = data.position
  }
}
