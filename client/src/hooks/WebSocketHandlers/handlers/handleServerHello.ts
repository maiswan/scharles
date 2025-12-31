import { AuthRequest } from "../../../../../shared/ClientMessage";
import { ServerMessage } from "../../../../../shared/ServerMessage";
import { ServerMessageHandlerContext } from "./ServerMessageHandler";
import PackageJson from "../../../../package.json";

const VERSION = PackageJson.version;

export default async function handleServerHello(_message: ServerMessage, context: ServerMessageHandlerContext) {
    const endpoint = context.getConfig("maiswan/scharles-client.authServer");
    const jwt = context.getJwt();

    if (jwt == null) {
        context.logger.warn('[useWebSocket.hello] No JWT provided, skipping authentication');
        return;
    }

    context.logger.info(`[useWebSocket.hello] Authenticating with ${endpoint}`);
    const authMessage: AuthRequest = { type: "authRequest", clientVersion: VERSION, jwt };
    context.send(authMessage);
}