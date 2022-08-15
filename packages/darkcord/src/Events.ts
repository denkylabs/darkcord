import { GatewayDispatchEvents } from "discord-api-types/v10";
import { Guild } from "./structures/Guild.ts";
import { Interaction } from "./structures/Interaction.ts";
import { Message } from "./structures/Message.ts";

export interface ClientEvents {
  WARN: [message: string];
  GATEWAY_SHARD_DEBUG: [message: string, id: string];
  GATEWAY_SHARD_ERROR: [err: Error, id: string];
  GATEWAY_SHARD_HELLO: [];
  GATEWAY_SHARD_PING: [ping: number, id: string];
  GATEWAY_SHARD_RESUME: [id: string];
  GATEWAY_SHARD_CLOSE: [code: number, reason: string, id: string];
  GATEWAY_SHARD_RECONNECT_REQUIRED: [id: string];
  SHARD_PRE_READY: [id: string];
  SHARD_READY: [id: string];
  CONNECT: [];
  RECONNECTING: [];
  INTERACTION_CREATE: [interaction: Interaction];
  MESSAGE_CREATE: [message: Message];
  GUILD_MEMBER_REMOVE: [];
  GUILD_CREATE: [guild: Guild];
  GUILD_UPDATE: [oldGuild: Guild, updatedGuild: Guild];
}

export type RawClientEvents = {
  [x in `RAW_${typeof GatewayDispatchEvents[keyof typeof GatewayDispatchEvents]}`]: [unknown];
};

export enum DarkcordEvents {
  Warn = "WARN",
  ShardDebug = "GATEWAY_SHARD_DEBUG",
  ShardError = "GATEWAY_SHARD_ERROR",
  ShardHello = "GATEWAY_SHARD_HELLO",
  ShardPing = "GATEWAY_SHARD_PING",
  ShardResume = "GATEWAY_SHARD_RESUME",
  ShardClose = "GATEWAY_SHARD_CLOSE",
  ShardReconnectRequired = "GATEWAY_SHARD_RECONNECT_REQUIRED",
  Connect = "CONNECT",
  Reconnecting = "RECONNECTING",
  ShardPreReady = "SHARD_PRE_READY",
  ShardReady = "SHARD_READY"
}

export const Events = {
  ...DarkcordEvents,
  ...GatewayDispatchEvents
} as typeof DarkcordEvents & typeof GatewayDispatchEvents;
