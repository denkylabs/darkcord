import {Routes, APIMessage} from "discord-api-types/v10"
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
  createMessage (channelId: string): Promise<APIMessage> {
    return this.requestHandler.post(Routes.channelMessages(channelId)) as Promise<APIMessage>
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on<E extends keyof RestEvents> (event: E, listener: (...args: RestEvents[E]) => any) {
    super.on(event, listener)
    return this
  }
}
