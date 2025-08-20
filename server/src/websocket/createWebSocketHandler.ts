import { WebSocketServer, WebSocket, Data } from "ws";
import Config from "../../config";
import { Server } from "http";
import { AuthenticationMessage, ClientMessage, Command, CommandRequest, CommandResponseMessage } from "../../../shared/command";
import { randomUUID } from "crypto";
import { CommandStore } from "../createCommandStore";
import PackageJson from "../../package.json";
import { INCOMPATIBLE_VERSION, UNAUTHENTICATED } from "../../../shared/codes";
import { Logger, ILogObj } from "tslog";
import jwt, { JwtPayload } from "jsonwebtoken";

export type WebSocketHandler = ReturnType<typeof createWebSocketHandler>;
const SERVER_MAJOR_VERSION = PackageJson.version.split(".")[0];

type ClientEntry = {
    id: number,
    socket: WebSocket,
    version: string,
    timeout: NodeJS.Timeout,
    isExpired: boolean,
}

export function createWebSocketHandler(logger: Logger<ILogObj>, httpServer: Server, config: Config, commandStore: CommandStore) {
    const clients: Record<number, ClientEntry> = {};
    const server = new WebSocketServer({ server: httpServer });

    function getUniqueId(): number {
        let id = 0;
        while (id in clients) { id++; }
        return id;
    }

    function createCommand(request: CommandRequest): Command {
        return {
            commandId: randomUUID(),
            module: request.module,
            action: request.action,
            parameters: request.parameters
        };
    }

    function send(clientId: number, command: Command) {
        if (!(clientId in clients)) {
            logger.warn("[webSocketHandler] Client", clientId, "does not exist");
            return;
        }

        const destination = clients[clientId];
        const commandJson = JSON.stringify(command);
        destination.socket.send(commandJson);
    }

    function unicast(request: CommandRequest) {
        const command = createCommand(request);
        commandStore.addRequest(command.commandId, request);

        logger.debug("[webSocketHandler] TX", command);
        send(request.clientIds[0], command);

        return command.commandId;
    }

    function multicast(request: CommandRequest) {
        const command = createCommand(request);
        commandStore.addRequest(command.commandId, request);

        logger.debug("[webSocketHandler] TX", command);
        request.clientIds.forEach(x => send(x, command));

        return command.commandId;
    }

    function broadcast(request: CommandRequest) {
        const everyone = Object.keys(clients).map(Number);
        request.clientIds = everyone;

        return multicast(request);
    }

    function purge(id: number) {
        if (!clients[id]) { return; }

        logger.info(`[webSocketHandler] Client ${id} has expired, disconnecting`);
        clients[id].socket.close(UNAUTHENTICATED, "Reauthenticate");
    }

    function initializeClient(id: number) {
        // Check client version
        const clientVersion = clients[id].version;
        const clientMajorVersion = clientVersion?.split(".")[0];

        if (clientMajorVersion !== SERVER_MAJOR_VERSION && !config.server.forceServeIncompatibleClients) {
            logger.warn(`[webSocketHandler] Refusing connection: client ${id} is version ${clientVersion}, but server is ${SERVER_MAJOR_VERSION}`);
            clients[id].socket.close(INCOMPATIBLE_VERSION, `Migrate to ${SERVER_MAJOR_VERSION} or enable forceServeIncompatibleClients in server settings`);
            return;
        }

        // Assign clientId to client
        logger.info(`[webSocketHandler] Client ${id} of version ${clientVersion} connected`);
        unicast({ clientIds: [id], module: "self", action: "set", parameters: ["clientId", id] });

        // Pass config
        Object.keys(config.modules).forEach(module => {
            const settings = config.modules[module].public;
            const keys = settings["data"];

            Object.keys(keys).forEach(key => {
                const value = keys[key];
                unicast({ clientIds: [id], module, action: "set", parameters: [key, value] });
            });

            const enableCommand = settings.isEnabled ? "enable" : "disable";
            const enableDebugCommand = settings.isDebug ? "enableDebug" : "disableDebug";
            unicast({ clientIds: [id], module, action: enableCommand, parameters: [] });
            unicast({ clientIds: [id], module, action: enableDebugCommand, parameters: [] });
        });
    }

    function acceptConnection(ws: WebSocket) {
        let id = getUniqueId();

        ws.on('message', (data: Data) => {
            if (data == null) { return; }
            if (clients[id]?.isExpired) { return; }

            const response: ClientMessage = JSON.parse((data as Buffer).toString());
            
            logger.debug(`[webSocketHandler] RX ${response.type} from client ${id}`);

            if (response.type === "CommandResponse") {
                const data: CommandResponseMessage = response.data;
                commandStore.addResponse(id, data);
                return;
            }

            if (response.type !== "Authentication") { return; }

            // Authentication
            const authMessage: AuthenticationMessage = response.data;

            try {
                const decoded = jwt.verify(authMessage.jwt, config.server.authentication.jwtSecret) as JwtPayload;
                if (!decoded.iat || !decoded.exp) { return; }
                const duration = Math.max(0, decoded.exp - decoded.iat) * 1000;

                const isNewClient = clients[id] == null;
                clearTimeout(clients[id]?.timeout);

                clients[id] = {
                    id,
                    socket: ws,
                    version: authMessage.version,
                    timeout: setTimeout(() => purge(id), duration),
                    isExpired: false,
                };
                logger.debug(`[webSocketHandler] Client ${id} will expire in ${duration}ms`);

                if (isNewClient) { initializeClient(id); }

            } catch (error) {
                logger.error(`[webSocketHandler]`, error);
            }
        })

        ws.on('close', () => {
            clients[id].isExpired = true;
            logger.info(`Client ${id} disconnected`);
        });
    }

    // Initialize server connection handling
    server.on('connection', acceptConnection);

    // Return public interface
    return {
        unicast,
        multicast,
        broadcast,
    };
}
