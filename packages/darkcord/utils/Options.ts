import {ClientOptions, ConnectionType} from "../client/ClientBuilder.ts"
import {DefaultIntents} from "./Utils.ts"

type RClientOptions = ClientOptions<ConnectionType>

export function verifyOptions (options?: RClientOptions) {
  if (!options) {
    return {
      intents: DefaultIntents
    }
  }

  const types = {
    intents: "number",
    type: "number",
    cacheFactory: "object",
    gateway: "object",
    requests: "object"
  }

  for (const key of Object.keys(options)) {
    const received = typeof options[key as keyof RClientOptions]

    if (received !== types[key as keyof typeof types]) {
      throw new TypeError(
        `The ${key} must be a ${
          types[key as keyof typeof types]
        }, but received ${received}`
      )
    }
  }

  return options
}
