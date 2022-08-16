import { RestAction } from "darkcord/rest"
import { APIInteractionResponseCallbackData, APIMessageInteraction, InteractionType } from "discord-api-types/v10"
import { BaseClient } from "../../client/BaseClient.ts"
import { ApplicationCommandInteraction, Interaction, MessageInteraction } from "../Interaction.ts"

type InteractionRespondRestActionFunc = (data: APIInteractionResponseCallbackData) => Promise<APIMessageInteraction>

export class InteractionRespondRestAction extends RestAction<APIMessageInteraction> {
  client: BaseClient

  constructor(public data: APIInteractionResponseCallbackData, public interaction: Interaction, action: InteractionRespondRestActionFunc) {
    super(action)
    this.client = interaction.client
  }

  async complete() {
    let guild
    const data = await this._complete(this.data)
    const _interaction = this.interaction as ApplicationCommandInteraction

    if (_interaction.type === InteractionType.ApplicationCommand && _interaction.guildId) {
      guild = await this.client.cache.guilds.get(_interaction.guildId)
    }

    return new MessageInteraction(data, this.client, guild)
  }

  async queue() {
    await this._complete(this.data)
  }

  static createAction(interaction: Interaction, data: APIInteractionResponseCallbackData, action: InteractionRespondRestActionFunc) {
    return new InteractionRespondRestAction(data, interaction, action)
  }
}
