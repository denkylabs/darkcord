import { ApiVersion as DiscordApiVersion } from "darkcord/rest/utils/utils.ts";
import { delay } from "deno/async";
import {
  APIGatewayBotInfo, APIUnavailableGuild, GatewayCloseCodes, GatewayDispatchEvents, GatewayOpcodes, GatewayReceivePayload, GatewaySendPayload, type GatewayHelloData,
  type GatewayResumeData
} from "discord-api-types/v10";
import { decompress_with } from "zlib";
import { GatewayClient } from "../client/GatewayClient.ts";
import { ClientEvents, Events } from "../Events.ts";
import { DiscordGatewayURL } from "../utils/Utils.ts";
import * as EventActions from "./actions/actions.ts";

const decoder = new TextDecoder();
export interface GatewayOptions {
    /**
     * The encoding of received gateway packets
     */
    encoding?: "json" | "etf"
    /**
     * Recommended to compress gateway packets
     * */
    compress?: boolean
    /**
     * The id of this gateway shard
     */
    shardId: string
}

export class GatewayError extends Error {
  constructor (message: string, public code: GatewayCloseCodes, public shardId: string) {
    super(message);
  }
}
export class Gateway {
  ws?: WebSocket;
  connected: boolean;
  preReady: boolean;
  sequenceId?: number;
  readonly options: Required<GatewayOptions>;
  lastHeartbeatAck: number;
  heartbeatInterval: number;
  heartbeatSendInterval?: number;
  destroyed: boolean;
  heartbeatAck: boolean;
  /**
   * The id of this gateway shard
   */
  readonly shardId: string;
  /**
     * This gateway shard ping
     */
  ping: number;
  fetchedGateway?: APIGatewayBotInfo;
  sessionId?: string;
  pendingGuilds?: number;
  pendingGuildsMap: Map<string, APIUnavailableGuild>;
  uptime?: Date;
  constructor (public client: GatewayClient, options?: GatewayOptions) {
    this.connected = false;

    this.preReady = false;

    this.destroyed = false;

    this.heartbeatAck = false;

    this.lastHeartbeatAck = -1;

    this.heartbeatInterval = -1;

    this.ping = -1;

    this.options = Object.freeze(options ?? {
      encoding: "json",
      compress: false,
      shardId: "0"
    }) as Readonly<Required<GatewayOptions>>;

    this.shardId = this.options.shardId;

    this.pendingGuildsMap = new Map();
  }

  /**
   * Connect to discord gateway
   */
  async connect () {
    if (this.fetchedGateway === undefined) {
      this.fetchedGateway = await this.client.getGateway();
    }

    this.init();
  }

  /**
   * Initialize websocket
   */
  init () {
    let wsUrl = `${DiscordGatewayURL}?v${DiscordApiVersion}&encoding=${this.options.encoding}`;

    if (this.options.compress === true) {
      wsUrl += "&compress=zlib-stream";
    }

    this.ws = new WebSocket(wsUrl);
    this.ws.binaryType = "arraybuffer";
    this.ws.onopen = this.#onOpen.bind(this);
    this.ws.onmessage = this.#onMessage.bind(this);
    this.ws.onclose = this.#onClose.bind(this);
  }

  /**
   * Reconnect gateway
   */
  reconnect () {
    if (this.destroyed) {
      return;
    }

    this._emit("Reconnecting");
    this.#debug("Discord asked to reconnect, reconnecting gateway...");
    clearInterval(this.heartbeatSendInterval);
    this.close(1000, "Discord Gateway Reconnect");
    this.init();
  }

  /**
   * Close this gateway
   * @param code Close code
   * @param reason Close reason
   */
  close (code: number, reason?: string) {
    this.#debug(`Closing Gateway with code ${code}${reason !== undefined ? ` and reason ${reason}` : ""} `);
    this.ws?.close(code, reason);

    this.ws?.removeEventListener("close", this.#onClose);
    this.ws?.removeEventListener("message", this.#onMessage);
    this.ws?.removeEventListener("open", this.#onOpen);
    this.ws = undefined;
  }

  /**
   * Destroy this gateway shard
   */
  destroy () {
    this.#debug("Destroying shard...");
    this.destroyed = true;

    if (this.heartbeatSendInterval !== undefined) {
      clearInterval(this.heartbeatSendInterval);
      this.heartbeatSendInterval = undefined;
    }

    this.close(1000, "Shard destroyed");
  }

  /**
   * Send data to gateway
   * @param data The data to be sent
   */
  send (data: GatewaySendPayload) {
    this.ws?.send(JSON.stringify(data));
  }

  /**
   * Send heartbeat to discord
   */
  sendHeartbeat () {
    this.send({
      op: GatewayOpcodes.Heartbeat,
      d: this.sequenceId ?? null
    });
    this.lastHeartbeatAck = Date.now();
  }

  ackHeartbeat () {
    if (this.destroyed === true) {
      return;
    }

    if (this.heartbeatAck === true) {
      this.heartbeatAck = false;
    } else {
      this.#debug("Dead connection found, reconnecting gateway...");
      clearInterval(this.heartbeatSendInterval);
      this.reconnect();
      return;
    }

    this.sendHeartbeat();
  }

  resume () {
    if (this.sessionId === undefined) {
      this.identify();
    }

    this.send({
      op: GatewayOpcodes.Resume,
      d: {
        token: this.client.token,
        session_id: this.sessionId as string,
        seq: this.sequenceId as number
      }
    });
  }

  identify () {
    if (this.client.token.startsWith("Bot") === false) {
      throw new Error("Invalid token");
    }

    if (this.preReady === false) {
      return;
    }

    const customProps = this.client.options.gateway?.properties;

    this.send({
      op: GatewayOpcodes.Identify,
      d: {
        token: this.client.token,
        intents: this.client.intents,
        properties: {
          browser: customProps?.browser ?? "Darkcord",
          os: Deno.build.os,
          device: customProps?.device ?? "Darkcord"
        },
        compress: this.options.compress,
        shard: [Number(this.shardId), this.client.options.gateway?.totalShards ?? this.fetchedGateway?.shards as number]
      }
    });
  }

  #onOpen () {
    this.#debug("Connected to Discord Gateway");
    this.client.emit(Events.Connect);
  }

  async #onClose (closeEvent: CloseEvent) {
    if (this.destroyed) {
      return;
    }

    const { reason, code } = closeEvent;

    if (reason === "Discord Gateway Reconnect") {
      return;
    }

    this._emit("ShardClose", code, reason, this.shardId);
    this.#debug(`Connection closed with code: ${code} ${reason}`);

    await this.#handleClose(code);
  }

  async #handleClose (code: GatewayCloseCodes) {
    const handler = ({
      [GatewayCloseCodes.UnknownOpcode]: () => {
        throw this.#error("Received unknown op code", code);
      },
      [GatewayCloseCodes.NotAuthenticated]: () => {
        throw this.#error("Not Authorized: Payload was sent before Identifying", code);
      },
      [GatewayCloseCodes.AlreadyAuthenticated]: () => {
        throw this.#error("Already Authenticated", code);
      },
      [GatewayCloseCodes.AuthenticationFailed]: () => {
        throw this.#error("Invalid Discord Token", code);
      },
      [GatewayCloseCodes.RateLimited]: () => {
        throw this.#error("You're rate limited", code);
      },
      [GatewayCloseCodes.InvalidIntents]: () => {
        throw this.#error("Invalid intents provided", code);
      },
      [GatewayCloseCodes.DisallowedIntents]: () => {
        throw this.#error("Intents is not whitelisted", code);
      },
      [GatewayCloseCodes.DecodeError]: () => {
        throw this.#error("Invalid payload was sent", code);
      },
      [GatewayCloseCodes.UnknownError]: () => {
        this.#debug("Unknown error encountered. Reconnecting...");
        this.reconnect();
      },
      [GatewayCloseCodes.InvalidSeq]: () => {
        this.#debug("Invalid Seq was sent. Reconnecting....");
        this.reconnect();
      },
      [GatewayCloseCodes.InvalidShard]: () => {
        this.#debug("Invalid shard was sent. Reconnecting...");
        this.reconnect();
      },
      [GatewayCloseCodes.InvalidAPIVersion]: () => {
        throw this.#error("Invalid API Version", code);
      },
      [GatewayCloseCodes.ShardingRequired]: () => {
        throw this.#error("Couldn't connect. Sharding is required!", code);
      },
      [GatewayCloseCodes.SessionTimedOut]: () => {
        this.#debug("Session Timeout. Reconnecting...");
      }
    })[code];

    if (handler === undefined) {
      this.#debug("Unknown close code. Reconnecting in 5s.");

      await delay(5_000);
      this.reconnect();
    }
  }

  #onMessage (message: MessageEvent) {
    try {
      let { data } = message;

      if (data instanceof ArrayBuffer) {
        data = new Uint8Array(data);
      }

      if (this.options.compress === true) {
        try {
          data = decompress_with(data, 0, (b: Uint8Array) => decoder.decode(b));
        } catch (err) {
          this._emit("ShardError", err, this.options.shardId);
          return;
        }
      }

      this.#onPacket(JSON.parse(data));
    } catch (err) {
      this._emit("ShardError", err, this.options.shardId);
    }
  }

  #onPacket (data: GatewayReceivePayload | GatewaySendPayload) {
    this.#handlePacket(data);
  }

  #handlePacket (data: GatewayReceivePayload | GatewaySendPayload) {
    const handler = ({
      [GatewayOpcodes.Hello]: (d: GatewayHelloData) => {
        this.heartbeatInterval = d.heartbeat_interval;
        this.#debug(`Received Hello, heartbeat interval: ${this.heartbeatInterval}`);

        this.sendHeartbeat();
        this.heartbeatSendInterval = setInterval(() => {
          this.ackHeartbeat();
        }, this.heartbeatInterval);

        this.client.emit(Events.ShardHello);

        if (this.preReady === false) {
          this.preReady = true;
          this.identify();
        } else {
          this.resume();
        }
      },
      [GatewayOpcodes.HeartbeatAck]: () => {
        this.heartbeatAck = true;
        this.ping = Date.now() - this.lastHeartbeatAck;
        this._emit("ShardPing", this.ping, this.shardId);
        this.#debug(`Received heartbeat ack. Pong: ${this.ping}`);
      },
      [GatewayOpcodes.InvalidSession]: () => {
        this.#debug(`Invalid Session received. Resumable: ${data.d === true ? "Yes" : "No"}`);

        if (data.d === false) {
          this.sessionId = undefined;
          this.sequenceId = undefined;
        }

        this.identify();
      },
      [GatewayOpcodes.Dispatch]: (d: unknown, s: number | null, t?: GatewayDispatchEvents) => {
        this.heartbeatAck = true;

        if (s !== null) {
          this.sequenceId = s;
        }

        if (t !== null && t !== undefined) {
          this.client.emit(`RAW_${t}`, d);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const actions = EventActions as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          actions[t]?.call(this, d as any);
        }
      },
      [GatewayOpcodes.Resume]: (d: GatewayResumeData) => {
        this.sessionId = d.session_id;
        this.sequenceId = d.seq;

        this.client.emit(Events.ShardResume, this.shardId);
      },
      [GatewayOpcodes.Reconnect]: () => {
        this.client.emit(Events.ShardReconnectRequired, this.shardId);
        this.#debug("Received reconnect Op Code");
        this.reconnect();
      }
    })[data.op as number];

    if (handler !== undefined) {
      return handler(
        data.d as typeof handler[keyof typeof handler],
        (data as { s: number }).s,
        (data as { t: GatewayDispatchEvents }).t
      );
    }
  }

  #error (message: string, code: number) {
    return new GatewayError(message, code, this.shardId);
  }

  #debug (message: string) {
    this.client.emit(Events.ShardDebug, message, this.shardId);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  _emit <E extends keyof typeof Events> (event: E, ...args: ClientEvents[typeof Events[E]]) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
    this.client.emit(Events[event], ...args as unknown);
  }
}
