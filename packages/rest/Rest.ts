import {
  Routes,
  APIMessage,
  RESTPostAPIChannelMessageJSONBody,
  APIInteractionResponseCallbackData,
  InteractionResponseType,
  APIGuild,
  APIGatewayBotInfo,
  APIUser,
  APIApplication
} from "discord-api-types/v10"
import {RequestHandler} from "./RequestHandler.ts"
import EventEmitter from "deno/events"
import {MessagePostData} from "../darkcord/structures/Message.ts"

export interface RateLimitEvent {
    global: boolean;
    timeout: number;
    limit: number;
    router: string;
    method: string;
}

export interface RestEvents {
  request: [data: unknown];
  rateLimit: [event: RateLimitEvent];
  warn: [message: string];
}

export class Rest extends EventEmitter {
  requestHandler: RequestHandler
  get: (router: string) => Promise<unknown>;
  post: (router: string, body?: BodyInit|undefined, contentType?: string|undefined) => Promise<unknown>
  patch: (router: string, body?: BodyInit|undefined, contentType?: string|undefined) => Promise<unknown>
  delete: (router: string) => Promise<unknown>
  put: (router: string, body?: BodyInit|undefined, contentType?: string|undefined) => Promise<unknown>
  constructor (token?: string, public requestTimeout = 15_000) {
    super()
    this.requestHandler = new RequestHandler(this, {
      token
    })

    this.get = this.requestHandler.get.bind(this.requestHandler)
    this.post = this.requestHandler.post.bind(this.requestHandler)
    this.patch = this.requestHandler.patch.bind(this.requestHandler)
    this.delete = this.requestHandler.delete.bind(this.requestHandler)
    this.put = this.requestHandler.put.bind(this.requestHandler)
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
      contentType: string | undefined

    if (files?.length) {
      contentType = undefined
      const form = new FormData()

      let index = 0
      for (const file of files) {
        form.append(`files[${index}]`, file.blob, file.name)
        index++
      }

      delete (data as MessagePostData).files

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

    return this.post(Routes.channelMessages(channelId), d, contentType) as Promise<APIMessage>
  }
  respondInteraction (interactionId: string, interactionToken: string, data: APIInteractionResponseCallbackData, type: InteractionResponseType) {
    return this.post(Routes.interactionCallback(interactionId, interactionToken), JSON.stringify({type, data}))
  }
  getWebhookMessage (webhookId: string, webhookToken: string, messageId: string): Promise<APIMessage> {
    return this.get(Routes.webhookMessage(webhookId, webhookToken, messageId)) as Promise<APIMessage>
  }
  getUser (userId: string) {
    return this.get(Routes.user(userId)) as Promise<APIUser>
  }
  getGuild (guildId: string) {
    return this.get(Routes.guild(guildId)) as Promise<APIGuild>
  }
  getGateway () {
    return this.get(Routes.gatewayBot()) as Promise<APIGatewayBotInfo>
  }
  getCurrentApplication () {
    return this.get(Routes.oauth2CurrentApplication()) as Promise<APIApplication>
  }
}
export declare interface Rest {
  on<E extends keyof RestEvents>(event: E, listener: (...args: RestEvents[E]) => unknown): this
  emit<E extends keyof RestEvents>(event: E, data: unknown): boolean
}
