import { Logger, ILogObj } from "tslog"
import { ClientMessage, CommandRequest } from "../../../shared/command"
import { CommandStore } from "../createCommandStore"
import Config from "../../config"
import { WebSocket } from "ws";
import StatusCode from "../../../shared/codes"

export type ClientMessageHandlerContext = {
    logger: Logger<ILogObj>,
    commandStore: CommandStore,
    config: Config,
    webSocket: WebSocket,
    includes(clientId: number): boolean,
    send(request: CommandRequest): void,
    addClient(clientId: number, socket: WebSocket, version: string, timeoutDuration: number): void,
    removeClient(clientId: number, code: StatusCode): void,
}

export type ClientMessageHandler = 
    (clientId: number, message: ClientMessage, context: ClientMessageHandlerContext) => void;