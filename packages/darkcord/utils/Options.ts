import {ClientOptions} from "../client/ClientBuilder.ts"
import {DefaultIntents} from "./Utils.ts"

export function verifyOptions (options?: ClientOptions) {
  if (!options) {
    return {
      intents: DefaultIntents
    }
  }

  const types = {
    intents: "number",
    type: "number",
    cacheFactory: "object"
  }

  for (const key of Object.keys(options)) {
    const received = typeof options[key as keyof ClientOptions]
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
