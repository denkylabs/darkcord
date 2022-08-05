import {
  Routes,
  APIMessage,
  RESTPostAPIChannelMessageJSONBody,
  APIInteractionResponseCallbackData,
  InteractionResponseType,
  APIGuild
} from "discord-api-types/v10"
import {RequestHandler} from "./RequestHandler.ts"
import EventEmitter from "deno/events"

export interface RateLimitEvent {
    global: boolean;
    timeout: number;
    limit: number;
    router: string;
    method: string;
}

export interface RestEvents {
    rateLimit: [event: RateLimitEvent]
    warn: [message: string]
}

export class Rest extends EventEmitter {
  requestHandler: RequestHandler
  constructor (token?: string) {
    super()
    this.requestHandler = new RequestHandler(this, {
      token
    })
  }
  /**
     * Post a message to a guild text or DM channel.
     * @returns A message object.
     * @fires A Message Create Gateway event.
     * @see message [formatting](https://discord.com/developers/docs/reference#message-formatting) for more information on how to properly format messages.
     * @param channelId The id of channel to create message
     */
  createMessage (channelId: string, data: RESTPostAPIChannelMessageJSONBody, files?: {name: string, description?: string, blob: Blob}[]): Promise<APIMessage> {
    let d: FormData | string,
      contentType: string

    if (files?.length) {
      contentType = "multipart/form-data"
      const form = new FormData()

      let index = 0
      for (const file of files) {
        form.append(`files[${index}]`, file.blob, file.name)
        index++
      }

      data.attachments = files.map((file, i) => ({
        id: i.toString(),
        filename: file.name,
        description: file.description
      }))

      form.append("payload_json", JSON.stringify(data))
      d = form
    } else {
      contentType = "application/json"
      d = JSON.stringify(data)
    }

    return this.requestHandler.post(Routes.channelMessages(channelId), d, contentType) as Promise<APIMessage>
  }
  respondInteraction (interactionId: string, interactionToken: string, data: APIInteractionResponseCallbackData, type: InteractionResponseType) {
    return this.requestHandler.post(Routes.interactionCallback(interactionId, interactionToken), JSON.stringify({type, data}))
  }
  getWebhookMessage (webhookId: string, webhookToken: string, messageId: string): Promise<APIMessage> {
    return this.requestHandler.get(Routes.webhookMessage(webhookId, webhookToken, messageId)) as Promise<APIMessage>
  }
  getGuild (guildId: string) {
    return this.requestHandler.get(Routes.guild(guildId)) as Promise<APIGuild>
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on<E extends keyof RestEvents> (event: E, listener: (...args: RestEvents[E]) => any) {
    super.on(event, listener)
    return this
  }
}
