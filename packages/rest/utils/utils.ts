export const ApiVersion = "10"
export const DiscordUrl = "https://discord.com"
export const ApiRoute = "/api/v"
export function getAPIOffset (serverDate: number | string) {
  return new Date(serverDate).getTime() - Date.now()
}

export function calculateReset (reset: number | string, serverDate: number | string) {
  return new Date(Number(reset) * 1000).getTime() - getAPIOffset(serverDate)
}
