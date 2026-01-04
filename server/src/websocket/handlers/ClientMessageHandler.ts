import { Logger, ILogObj } from "tslog"
import { ClientMessage } from "../../../../shared/ClientMessage"
import { CommandStore } from "../../createCommandStore"
import Config from "../../../config"
import { WebSocket } from "ws";
import StatusCode from "../../../../shared/StatusCode"
import { ServerMessage } from "../../../../shared/ServerMessage";

export type ClientMessageHandlerContext = {
    logger: Logger<ILogObj>,
    commandStore: CommandStore,
    config: Config,
    webSocket: WebSocket,
    includes(clientId: number): boolean,
    send(clientIds: number[], message: ServerMessage): void,
    addClient(clientId: number, socket: WebSocket, version: string): void,
    removeClient(clientId: number, code: StatusCode): void,
}

export type ClientMessageHandler = 
    (clientId: number, message: ClientMessage, context: ClientMessageHandlerContext) => void;