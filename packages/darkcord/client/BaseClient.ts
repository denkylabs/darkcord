import {EventEmitter} from "deno/events"
import {ClientEvents} from "../Events.ts"

export abstract class BaseClient extends EventEmitter<Record<keyof ClientEvents, ClientEvents[keyof ClientEvents]>> {
}
