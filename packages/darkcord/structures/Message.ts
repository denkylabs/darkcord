import type {ReactionCache} from "./../cache/ReactionCache.ts"
import {Reaction} from "./Emoji.ts"
import {
  APIMessage,
  APIAttachment,
  APIEmbed,
  MessageType,
  APIActionRowComponent,
  APIMessageActionRowComponent,
  MessageFlags as Flags,
  APIMessageReference
} from "discord-api-types/v10"
import {Base} from "./Base.ts"
import {BaseClient} from "../client/BaseClient.ts"
import {User} from "./User.ts"
import {BitField} from "./BitField.ts"
import {MessageInteraction} from "./Interaction.ts"

class MessageFlags extends BitField<Flags, typeof Flags> {
  constructor (rawFlags: Flags = 0) {
    super(rawFlags, Flags)
  }
  static Flags = Flags
}

export class Message extends Base {
  /**
     * ID of the channel the message was sent in
     */
  channelId: string
  /**
     * If the message is a response to an Interaction, this is the id of the interaction's application
     */
  applicationId?: string
  /**
     * Any attached files
     *
     * @See https://discord.com/developers/docs/resources/channel#attachment-object
     */
  attachment: APIAttachment[]
  /**
     * Contents of the message
     */
  content: string
  /**
     * Any embedded content
     *
     * @See https://discord.com/developers/docs/resources/channel#embed-object
     */
  embeds: APIEmbed[]
  /**
     * Type of message
     *
     * @See https://discord.com/developers/docs/resources/channel#message-object-message-types
     */
  type: MessageType
  /**
     * Sent if the message contains components like buttons, action rows, or other interactive components
     */
  components?: APIActionRowComponent<APIMessageActionRowComponent>[]
  /**
     * Message flags combined as a bitfield
     *
     * @See https://discord.com/developers/docs/resources/channel#message-object-message-flags
     * @See https://en.wikipedia.org/wiki/Bit_field
     */
  flags?: MessageFlags
  /**
     * When this message was sent
     */
  timestamp: number
  /**
     * Whether this message is pinned
     */
  pinned: boolean
  /**
     * When this message was edited (or null if never)
     */
  editedTimestamp: number | null
  /**
     * Reference data sent with crossposted messages, replies, pins, and thread starter messages
     *
     * @See https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure
     */
  messageReference?: APIMessageReference
  /**
     * Reactions to the message
     *
     * @See {@link Reaction}
     */
  reactions: ReactionCache
  /**
     * A nonce that can be used for optimistic message sending (up to 25 characters)
     *
     * **You will not receive this from further fetches.
     * This is received only once from a `MESSAGE_CREATE` event to ensure it got sent**
     */
  nonce?: string | number
  /**
    * The author of this message (only a valid user in the case where the message is generated by a user or bot user)
    *
    * If the message is generated by a webhook, the author object corresponds to the webhook's id, username, and avatar. You can tell if a message is generated by a webhook by checking for the webhook_id property
    *
    * @See {@link User}
    */
  author: User
  /**
    * If the message is generated by a webhook, this is the webhook's id
    */
  webhookId?: string
  /**
    * Sent if the message is a response to an Interaction
    */
  interaction: MessageInteraction|null
  constructor (data: APIMessage, client: BaseClient) {
    super(data.id)

    const {edited_timestamp: editedTimestamp, interaction} = data
    this.channelId = data.channel_id
    this.applicationId = data.application_id
    this.attachment = data.attachments
    this.content = data.content
    this.embeds = data.embeds
    this.type = data.type
    this.components = data.components
    this.flags = new MessageFlags(data.flags)
    this.timestamp = Date.parse(data.timestamp)
    this.pinned = data.pinned
    this.editedTimestamp = editedTimestamp !== undefined ? Date.parse(editedTimestamp as string) : null
    this.messageReference = data.message_reference
    this.nonce = data.nonce
    this.author = new User(data.author)
    this.webhookId = data.webhook_id
    this.reactions = client.cache.factory.makeReactionCache()
    this.interaction = interaction !== undefined ? new MessageInteraction(interaction, client) : null

    if (data.reactions !== undefined) {
      for (const _reaction of data.reactions) {
        const reaction = new Reaction(_reaction)

        this.reactions.add(reaction)
      }
    }
  }
}
