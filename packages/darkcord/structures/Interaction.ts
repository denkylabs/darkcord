/* eslint-disable no-use-before-define */
import {
  APIApplicationCommandInteractionDataOption,
  APIApplicationCommandOption,
  APIApplicationCommandSubcommandOption,
  APIChatInputApplicationCommandInteractionData,
  APIInteraction,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionType,
  LocalizationMap,
  Snowflake
} from "discord-api-types/v10.ts"

type AnyInteraction = InteractionType.Ping |
    InteractionType.ApplicationCommand |
    InteractionType.MessageComponent |
    InteractionType.ApplicationCommandAutocomplete |
    InteractionType.ModalSubmit

export class Interaction {
  readonly applicationId: Snowflake
  readonly type: AnyInteraction
  readonly token: string
  readonly id: Snowflake
  readonly version: 1
  constructor (data: APIInteraction) {
    this.id = data.id
    this.token = data.token
    this.type = data.type
    this.applicationId = data.application_id
    this.version = data.version
  }
  /**
     * Resolves data and return the specified interaction structure
     */
  static from (data: APIInteraction) {
    switch (data.type) {
      case InteractionType.ApplicationCommand: {
        return new ApplicationCommandInteraction(data)
      }
      default: {
        return new Interaction(data)
      }
    }
  }
}

type AnyOptionType = ApplicationCommandOptionType.Boolean |
    ApplicationCommandOptionType.Subcommand |
    ApplicationCommandOptionType.SubcommandGroup |
    ApplicationCommandOptionType.String |
    ApplicationCommandOptionType.Integer |
    ApplicationCommandOptionType.User |
    ApplicationCommandOptionType.Channel |
    ApplicationCommandOptionType.Role |
    ApplicationCommandOptionType.Mentionable |
    ApplicationCommandOptionType.Number |
    ApplicationCommandOptionType.Attachment

export type AnyOption = ApplicationCommandOption |
    ApplicationSubCommandOption

export class ApplicationCommandInteractionOption {
  readonly name: string
  readonly type: AnyOptionType
  constructor (data: APIApplicationCommandInteractionDataOption) {
    this.name = data.name
    this.type = data.type
  }
}

export class ApplicationCommandInteraction extends Interaction {
}

export class ChatInputApplicationCommandInteractionData {
  /**
     * The type of the invoked command
     */
  readonly type: ApplicationCommandType.ChatInput
  /**
     * The name of the invoked command
     */
  readonly name: string
  /**
     * The ID of the invoked command
     */
  readonly id: Snowflake
  /**
     * The guild ID of the invoked command
     */
  readonly guildId?: Snowflake
  readonly options?: ApplicationCommandInteractionOption[]
  constructor (data: APIChatInputApplicationCommandInteractionData) {
    this.type = data.type
    this.name = data.name
    this.id = data.id

    this.guildId = data.guild_id

    if ("options" in data) {
      this.options = data.options?.map(d => new ApplicationCommandInteractionOption(d))
    }
  }
}

export class ApplicationCommandOption {
  readonly name: string
  readonly type: AnyOptionType
  readonly nameLocalizations?: LocalizationMap | null
  readonly description: string
  readonly descriptionLocalizations?: LocalizationMap | null
  readonly required?: boolean
  constructor (data: APIApplicationCommandOption) {
    this.type = data.type
    this.name = data.name
    this.nameLocalizations = data.name_localizations
    this.description = data.description
    this.descriptionLocalizations = data.description_localizations
    this.required = data.required
  }
  static from (data: APIApplicationCommandOption) {
    switch (data.type) {
      case ApplicationCommandOptionType.Subcommand: {
        return new ApplicationSubCommandOption(data)
      }
      case ApplicationCommandOptionType.SubcommandGroup: {
        return new ApplicationSubCommandOption<true>(data as unknown as APIApplicationCommandSubcommandOption)
      }
      default: {
        return new ApplicationCommandOption(data)
      }
    }
  }
}

export class ApplicationSubCommandOption<Group = false> extends ApplicationCommandOption {
  // eslint-disable-next-line no-use-before-define
  readonly options?: Group extends true ? ApplicationSubCommandOption[] : AnyOption[]
  constructor (data: APIApplicationCommandSubcommandOption) {
    super(data)

    if ("options" in data) {
      this.options = data.options?.map(d => ApplicationCommandOption.from(d))
    }
  }
}
