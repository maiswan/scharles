import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthenticationMessage, ClientMessage } from "../../../shared/command";
import { ClientMessageHandlerContext } from "./ClientMessageHandler";
import StatusCode from "../../../shared/codes";
import PackageJson from "../../package.json";

const SERVER_MAJOR_VERSION = PackageJson.version.split(".")[0];

function initializeClient(clientId: number, clientVersion: string, context: ClientMessageHandlerContext) {

    const { logger, config, send, removeClient } = context;

    // Check client version
    const clientMajorVersion = clientVersion?.split(".")[0];

    if (clientMajorVersion !== SERVER_MAJOR_VERSION && !config.server.forceServeIncompatibleClients) {
        logger.warn(`[webSocketHandler] Refusing connection: client ${clientId} is version ${clientVersion}, but server is ${SERVER_MAJOR_VERSION}`);
        removeClient(clientId, StatusCode.INCOMPATIBLE_VERSION);
        return;
    }

    // Assign clientId to client
    logger.info(`[webSocketHandler] Client ${clientId} of version ${clientVersion} connected`);
    send({ clientIds: [clientId], module: "self", action: "set", parameters: ["clientId", clientId] });

    // Pass config
    Object.keys(config.modules).forEach(module => {
        const settings = config.modules[module].public;
        const keys = settings["data"];

        Object.keys(keys).forEach(key => {
            const value = keys[key];
            send({ clientIds: [clientId], module, action: "set", parameters: [key, value] });
        });

        const enableCommand = settings.isEnabled ? "enable" : "disable";
        const enableDebugCommand = settings.isDebug ? "enableDebug" : "disableDebug";
        send({ clientIds: [clientId], module, action: enableCommand, parameters: [] });
        send({ clientIds: [clientId], module, action: enableDebugCommand, parameters: [] });
    });
}

export default function authenticationHandler(clientId: number, message: ClientMessage, context: ClientMessageHandlerContext) {

    const authMessage = message.data as AuthenticationMessage;
    const { logger, config, webSocket, includes, addClient, removeClient } = context;

    const decoded = jwt.verify(authMessage.jwt, config.server.authentication.jwtSecret) as JwtPayload;
    const duration = Math.max(0, (decoded.exp ?? 0) - (decoded.iat ?? 0)) * 1000;
    if (duration <= 0) {
        removeClient(clientId, StatusCode.UNAUTHENTICATED);
        return;
    }

    const isNewClient = !includes(clientId);

    addClient(clientId, webSocket, authMessage.version, duration);
    logger.debug(`[webSocketHandler] Added client ${clientId} with expiry in ${duration} ms`);

    if (isNewClient) { initializeClient(clientId, authMessage.version, context); }
}
