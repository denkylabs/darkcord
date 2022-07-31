import {Interaction} from "./structures/Interaction.ts"

export interface ClientEvents {
    WARN: [message: string];
    INTERACTION_CREATE: [interaction: Interaction];
    MESSAGE_CREATE: [];
    GUILD_MEMBER_REMOVE: [];
}
