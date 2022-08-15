import {GatewayIntentBits} from "discord-api-types/v10"

export type DiscordToken = `Bot ${string}`
export const DefaultIntents = GatewayIntentBits.Guilds
export const DiscordGatewayURL = "wss://gateway.discord.gg/"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeObjectLiteral <K extends string | number = string | number, Args extends any[] = [unknown], Return = void> (keys: K[], values: ((...args: Args) => Return)[]) {
  const obj = {} as Record<K, (...args: Args) => Return>

  let index = 0
  for (const key of keys) {
    obj[key] = values[index]
    index++
  }

  return obj
}
