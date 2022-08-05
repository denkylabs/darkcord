import {
  APIChannel,
  APITextChannel,
  ChannelFlags as Flags,
  ChannelType
} from "discord-api-types/v10"
import {Base} from "./Base.ts"
import {BitField} from "./BitField.ts"
import {BaseClient} from "../client/BaseClient.ts"
import {MessagePostData} from "./Message.ts"
import {TextChannelCreateMessageRestAction} from "./actions/TextChannel.ts"

export class ChannelFlags extends BitField<Flags, typeof Flags> {
  constructor (flags: Flags) {
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
  readonly flags: ChannelFlags|null
  constructor (data: APIChannel) {
    super(data.id)

    const {flags, name} = data
    this.type = data.type
    this.name = typeof name === "string" ? name : null
    this.flags = flags !== undefined ? new ChannelFlags(data.flags as Flags) : null
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
  lastPinnedMessage?: string|null
  constructor (data: APITextChannel, public client: BaseClient) {
    super(data)

    const {nsfw} = data
    this.parentId = data.parent_id
    this.topic = data.topic
    this.position = data.position
    this.isNsfw = nsfw !== undefined ? nsfw : false
    this.lastMessageId = data.last_message_id
    this.rateLimitPerUser = data.rate_limit_per_user
    this.lastPinnedMessage = data.last_pin_timestamp
  }
  send (data: MessagePostData) {
    return new TextChannelCreateMessageRestAction(data, this, (d) => {
      return this.client.rest.createMessage(this.id, d, d.files)
    })
  }
}
