![Library logo](https://cdn.discordapp.com/attachments/846411409293967450/864228830053662730/110_Sem_Titulo_20210712163602.png)

## Example
### Gateway
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
### Http Interaction
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