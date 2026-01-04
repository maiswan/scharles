import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest, ClientMessage } from "../../../../shared/ClientMessage";
import { ClientMessageHandlerContext } from "./ClientMessageHandler";
import StatusCode from "../../../../shared/StatusCode";
import PackageJson from "../../../package.json";
import { AuthAccepted } from "../../../../shared/ServerMessage";
import Config from "../../../config";

const SERVER_VERSION = PackageJson.version;
const SERVER_MAJOR_VERSION = SERVER_VERSION.split(".")[0];

function isClientCompatible(clientVersion: string, config: Config): boolean {
    const clientMajorVersion = clientVersion.split(".")[0];

    return clientMajorVersion === SERVER_MAJOR_VERSION || config.server.forceServeIncompatibleClients;
}

function isJwtValid(jwtToken: string, jwtSecret: string) {
    try {
        const decoded = jwt.verify(jwtToken, jwtSecret) as JwtPayload;
        const duration = Math.max(0, (decoded.exp ?? 0) - (decoded.iat ?? 0)) * 1000;
        return duration > 0;
    } catch {
        return false;
    }
}

export default function handleAuthRequest(clientId: number, message: ClientMessage, context: ClientMessageHandlerContext) {

    const authMessage = message as AuthRequest;
    const { logger, config, webSocket, send, addClient, removeClient } = context;

    // Check client version
    if (!isClientCompatible(authMessage.clientVersion, config)) {
        logger.warn(`[webSocketHandler] Refusing connection: client ${clientId} is version ${authMessage.clientVersion}, but server is ${SERVER_VERSION}`);
        removeClient(clientId, StatusCode.INCOMPATIBLE_VERSION);
        return;
    }

    // Check JWT expiry
    const isValid = isJwtValid(authMessage.jwt, config.server.authentication.jwtSecret);
    if (!isValid) {
        logger.warn(`[webSocketHandler] Refusing connection: client ${clientId} provided an expired JWT`);
        removeClient(clientId, StatusCode.UNAUTHENTICATED);
        return;
    }

    // Client is good, add to our records
    addClient(clientId, webSocket, authMessage.clientVersion);
    
    const response: AuthAccepted = {
        type: "authAccepted",
    };
    send([clientId], response);

    logger.debug(`[webSocketHandler] Authenticated client ${clientId}`);
}
