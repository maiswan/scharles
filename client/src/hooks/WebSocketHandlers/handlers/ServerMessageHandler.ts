import { type ConfigKey } from "../../ConfigurationContext";
import { ServerMessage } from "../../../../../shared/ServerMessage";
import { useLogger } from "../../useLogger";
import { ClientMessage } from "../../../../../shared/ClientMessage";
import { CommandAPI } from "../../CommandBus";

export type ServerMessageHandlerContext = {
    getJwt: () => string | null,
    getConfig: (key: ConfigKey) => string,
    logger: ReturnType<typeof useLogger>,
    send: (message: ClientMessage) => void;
    dispatchCommand: (commandAPI: CommandAPI) => void;
}

export type ServerMessageHandler = 
    (message: ServerMessage, context: ServerMessageHandlerContext) => void;