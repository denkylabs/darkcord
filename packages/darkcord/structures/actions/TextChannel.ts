import {APIMessage} from "discord-api-types/v10"
import {RestAction} from "darkcord/rest"
import {TextChannel} from "../Channel.ts"
import {MessagePostData, Message} from "../Message.ts"

type MessagePostRestActionFunc = (data: MessagePostData) => Promise<APIMessage>

export class TextChannelCreateMessageRestAction extends RestAction<APIMessage> {
  constructor (
        public data: MessagePostData,
        public channel: TextChannel,
        action: MessagePostRestActionFunc
  ) {
    super(action)
  }
  async complete () {
    const data = await this._complete(this.data)
    return new Message(data, this.channel.client)
  }
  async queue () {
    await this._complete(this.data)
  }
  static createAction (channel: TextChannel, data: MessagePostData, action: MessagePostRestActionFunc) {
    return new TextChannelCreateMessageRestAction(data, channel, action)
  }
}
