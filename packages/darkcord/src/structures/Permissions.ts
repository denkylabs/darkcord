import { PermissionFlagsBits } from "discord-api-types/v10";

export class Permissions {
  allow: bigint;
  deny: bigint;

  constructor(allow: bigint, deny = 0) {
    this.allow = BigInt(allow);
    this.deny = BigInt(deny);
  }

  /**
   * Check if this permission allows a specific permission
   * @param permissions The permissions bits to verify
   */
  has(permissions: bigint) {
    return (this.allow & permissions) === permissions;
  }

  static Flags = PermissionFlagsBits;
  static AllText =
    this.Flags.CreateInstantInvite |
    this.Flags.ManageChannels |
    this.Flags.AddReactions |
    this.Flags.ViewChannel |
    this.Flags.SendMessages |
    this.Flags.SendTTSMessages |
    this.Flags.ManageMessages |
    this.Flags.EmbedLinks |
    this.Flags.AttachFiles |
    this.Flags.ReadMessageHistory |
    this.Flags.MentionEveryone |
    this.Flags.UseExternalEmojis |
    this.Flags.UseExternalStickers |
    this.Flags.ManageRoles |
    this.Flags.ManageThreads |
    this.Flags.ManageWebhooks |
    this.Flags.UseApplicationCommands |
    this.Flags.CreatePrivateThreads |
    this.Flags.CreatePublicThreads |
    this.Flags.SendMessagesInThreads;

  static AllVoice =
    this.Flags.CreateInstantInvite |
    this.Flags.ManageChannels |
    this.Flags.PrioritySpeaker |
    this.Flags.Stream |
    this.Flags.ViewChannel |
    this.Flags.Connect |
    this.Flags.Speak |
    this.Flags.MuteMembers |
    this.Flags.DeafenMembers |
    this.Flags.MoveMembers |
    this.Flags.UseVAD |
    this.Flags.ManageRoles |
    this.Flags.RequestToSpeak |
    this.Flags.UseEmbeddedActivities;

  static AllGuild =
    this.Flags.KickMembers |
    this.Flags.BanMembers |
    this.Flags.Administrator |
    this.Flags.ManageChannels |
    this.Flags.ViewAuditLog |
    this.Flags.ViewGuildInsights |
    this.Flags.ChangeNickname |
    this.Flags.ManageNicknames |
    this.Flags.ManageRoles |
    this.Flags.ManageWebhooks |
    this.Flags.ManageEmojisAndStickers |
    this.Flags.ManageEvents |
    this.Flags.ModerateMembers;

  static All = this.AllText | this.AllVoice | this.AllGuild;
}
