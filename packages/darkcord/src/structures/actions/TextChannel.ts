import { RestAction, RestActionCompleteOptions, RestActionQueueOptions } from "darkcord/rest"
import { APIMessage } from "discord-api-types/v10"
import { TextChannel } from "../Channel.ts"
import { Message, MessagePostData } from "../Message.ts"

type MessagePostRestActionFunc = (data: MessagePostData) => Promise<APIMessage>

export class TextChannelCreateMessageRestAction extends RestAction<APIMessage> {
  constructor(public data: MessagePostData, public channel: TextChannel, action: MessagePostRestActionFunc) {
    super(action)
  }

  async complete(options?: RestActionCompleteOptions) {
    const data = await this._complete(this.data)

    if (options?.returnApiObject === true) {
      return data
    }

    return new Message(data, this.channel.client)
  }

  async queue(options?: RestActionQueueOptions) {
    if (options?.sendIn !== undefined) {
      setTimeout(() => this.queue({ isImportant: options.isImportant }), options.sendIn)
      return
    }

    await this._complete(this.data)
  }

  static createAction(channel: TextChannel, data: MessagePostData, action: MessagePostRestActionFunc) {
    return new TextChannelCreateMessageRestAction(data, channel, action)
  }
}
