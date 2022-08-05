import {
  APIInteractionResponseCallbackData,
  APIMessageInteraction,
  InteractionType
} from "discord-api-types/v10"
import {RestAction} from "darkcord/rest"
import {BaseClient} from "../../client/BaseClient.ts"
import {Guild} from "../Guild.ts"
import {Interaction, ApplicationCommandInteraction, MessageInteraction} from "../Interaction.ts"

type InteractionRespondRestActionFunc = (data: APIInteractionResponseCallbackData) => Promise<APIMessageInteraction>

export class InteractionRespondRestAction extends RestAction<APIMessageInteraction> {
  #guild?: Guild
  client: BaseClient
  constructor (
    public data: APIInteractionResponseCallbackData,
    interaction: Interaction,
    action: InteractionRespondRestActionFunc) {
    super(action)
    this.client = interaction.client
    const _interaction = (interaction as ApplicationCommandInteraction)

    if (_interaction.type === InteractionType.ApplicationCommand && _interaction.guildId) {
      this.#guild = this.client.cache.guilds.get(_interaction.guildId)
    }
  }
  async complete () {
    const data = await this._complete(this.data)
    return new MessageInteraction(data, this.client, this.#guild)
  }
  async queue () {
    await this._complete(this.data)
  }
  static createAction (interaction: Interaction, data: APIInteractionResponseCallbackData, action: InteractionRespondRestActionFunc) {
    return new InteractionRespondRestAction(data, interaction, action)
  }
}
