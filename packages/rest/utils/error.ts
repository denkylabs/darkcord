export class DiscordAPIError extends Error {
  constructor (
    public router: string,
    public method: string,
    public code: number,
    errors: Record<string, unknown>) {
    super()

    this.message = JSON.stringify(errors)
  }
}

export class RequestError extends Error {
  constructor (
    public router: string,
    public method: string,
    public message: string,
    public name: string,
    public code: number
  ) {
    super()
  }
}
