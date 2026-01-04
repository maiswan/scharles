import { ServerMessage } from "../../../../../shared/ServerMessage";
import { useLogger } from "../../useLogger";
import { ClientMessage } from "../../../../../shared/ClientMessage";
import { CommandAPI } from "../../CommandBus";
import { Config } from "../../ConfigurationContext";

export type ServerMessageHandlerContext = {
    token: string | undefined,
    config: Config,
    logger: ReturnType<typeof useLogger>,
    send: (message: ClientMessage) => void,
    dispatchCommand: (commandAPI: CommandAPI) => void,
}

export type ServerMessageHandler = 
    (message: ServerMessage, context: ServerMessageHandlerContext) => void;