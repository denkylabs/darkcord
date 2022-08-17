<div align="center">
	<br />
    	<p>
		<img src="https://cdn.discordapp.com/attachments/846411409293967450/864228830053662730/110_Sem_Titulo_20210712163602.png" width="546" alt="darkcord" />
	</p>
    <br />
    	<p>
		<a href="https://github.com/denkylabs/darkcord/actions"><img src="https://github.com/denkylabs/darkcord/actions/workflows/tests.yml/badge.svg" alt="Tests status" /></a>
	</p>
</div>

## About
Darkcord is a [Deno](https://deno.land/) and [Node.js](https://nodejs.org) module to easily interact with
[Discord API](https://discord.com/developers/docs/intro).

## Instalation
**Node.js 16.9.0 or newer is required to installation.**

```sh-session
npm install darkcord
yarn add darkcord
pnpm add darkcord
```

## Example Usage

### Gateway Example
```js
import {
    ClientBuilder,
    ConnectionType,
    GatewayIntentBits,
    Events,
    Utils
} from "darkcord"

const client = new ClientBuilder("Bot token", {
    type: ConnectionType.Gateway,
    intents: GatewayIntentBits.Guilds
}).build()

client.on(Events.InteractionCreate, async interaction => {
    if (Utils.isChatInputApplicationCommandInteraction(interaction)) {
        await interaction.reply({ content: "Pong!" })
    }
})

client.connect()
```
### HTTP Interactions Example
```js
import {
    ClientBuilder,
    ConnectionType,
    GatewayIntentBits,
    Events,
    Utils
} from "darkcord"

const client = new ClientBuilder("public key", {
    type: ConnectionType.Interaction
}).build()

client.on(Events.InteractionCreate, async interaction => {
    if (Utils.isChatInputApplicationCommandInteraction(interaction)) {
        await interaction.reply({ content: "Pong!" })
    }
})

client.connect()
```

## Useful Links
- [Website](https://darkcord.denkylabs.com)
- [GitHub](https://github.com/denkylabs/darkcord)
- [npm](https://npmjs.com/package/darkcord)
- [Discord API Discord server](https://discord.gg/discord-api)
- [Denky Labs Discord server](https://discord.gg/98DNuKDx8j)