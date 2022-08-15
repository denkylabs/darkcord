import { GatewayGuildCreateDispatchData, GatewayInteractionCreateDispatchData, GatewayMessageCreateDispatchData, GatewayReadyDispatchData, InteractionType } from "discord-api-types/v10";
import { Events } from "../../Events.ts";
import { Channel } from "../../structures/Channel.ts";
import { Emoji, Reaction } from "../../structures/Emoji.ts";
import { Guild } from "../../structures/Guild.ts";
import { ApplicationCommandInteraction, Interaction } from "../../structures/Interaction.ts";
import { Member } from "../../structures/Member.ts";
import { Message } from "../../structures/Message.ts";
import { Role } from "../../structures/Role.ts";
import { Sticker } from "../../structures/Sticker.ts";
import { User } from "../../structures/User.ts";
import { Gateway } from "../Gateway.ts";

export async function READY(this: Gateway, data: GatewayReadyDispatchData) {
  this._emit("ShardPreReady", this.shardId);

  this.pendingGuilds = data.guilds.length;
  this.uptime = new Date();
  this.sessionId = data.session_id;

  this.client.applicationId = data.application.id;
  this.client.applicationFlags = data.application.flags;

  await this.client.cache.users.add(new User(data.user, this.client));

  for (const guild of data.guilds) {
    this.pendingGuildsMap.set(guild.id, guild);
  }

  this._emit("ShardReady", this.shardId);
}

export async function GUILD_CREATE(this: Gateway, data: GatewayGuildCreateDispatchData) {
  const guild = new Guild(data, this.client);

  for await (const apiMember of data.members) {
    await guild.members.add(new Member(apiMember, guild), true);
  }

  for await (const apiChannel of data.channels) {
    const channel = Channel.from(apiChannel, this.client);
    await guild.channels.add(channel, true);
    await this.client.cache.channels.add(channel, true);
  }

  for await (const apiRole of data.roles) {
    await guild.roles.add(new Role(apiRole), true);
  }

  for await (const apiSticker of data.stickers) {
    await guild.stickers.add(new Sticker(apiSticker), true);
  }

  for await (const apiEmoji of data.emojis) {
    await guild.emojis.add(new Emoji(apiEmoji, this.client), true);
  }

  this.client.emit(Events.GuildCreate, guild);
}

export async function MESSAGE_CREATE(this: Gateway, data: GatewayMessageCreateDispatchData) {
  const message = new Message(data, this.client);
  message.channel = await this.client.cache.channels.get(message.channelId);

  if (data.reactions !== undefined) {
    for await (const _reaction of data.reactions) {
      const reaction = new Reaction(_reaction, this.client);

      await message.reactions.add(reaction);
    }
  }

  this.client.emit(Events.MessageCreate, message);
}

export async function INTERACTION_CREATE(this: Gateway, data: GatewayInteractionCreateDispatchData) {
  const interaction = Interaction.from(data, this.client) as Interaction & ApplicationCommandInteraction;

  if (interaction.type === InteractionType.ApplicationCommand) {
    interaction.guild = interaction.guildId !== undefined ? await this.client.cache.guilds.get(interaction.guildId) : null;
  }

  this.client.emit(Events.InteractionCreate, interaction);
}
