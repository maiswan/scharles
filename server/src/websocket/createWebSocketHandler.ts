import { WebSocketServer, WebSocket, Data } from "ws";
import { Config } from "../../config";
import { Server } from "http";
import { Command, CommandRequest, CommandResponse } from "../../../shared/command";
import { randomUUID } from "crypto";
import { CommandStore } from "../createCommandStore";
import PackageJson from "../../package.json";
import { INCOMPATIBLE_VERSION } from "../../../shared/codes";
import { Logger, ILogObj } from "tslog";

export type WebSocketHandler = ReturnType<typeof createWebSocketHandler>;
const serverVersion = PackageJson.version;

export function createWebSocketHandler(logger: Logger<ILogObj>, httpServer: Server, config: Config, commandStore: CommandStore) {
    const clients: Record<number, WebSocket> = {};
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
        destination.send(commandJson);
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

    function initializeClient(ws: WebSocket, request: Request) {
        const id = getUniqueId();
        clients[id] = ws;

        // Check client version
        const searchParams = new URLSearchParams(request.url.substring(1)); // remove leading "/"
        const clientVersion = searchParams.get("version");
        const clientMajorVersion = clientVersion?.split(".")[0];
        const serverMajorVersion = serverVersion.split(".")[0];

        if (clientMajorVersion !== serverMajorVersion && !config.server.forceServeIncompatibleClients) {
            logger.warn(`[webSocketHandler] Refusing connection: client ${id} is version ${clientVersion}, but server is ${serverVersion}`);
            ws.close(INCOMPATIBLE_VERSION, `Migrate to ${serverVersion} or enable forceServerIncompatibleClients in server settings`);
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

        ws.on('message', (data: Data) => {
            if (data == null) { return; }
            const response = JSON.parse((data as Buffer).toString()) as CommandResponse;

            logger.debug("[webSocketHandler] RX", response);
            commandStore.addResponse(response);
        })

        ws.on('close', () => {
            logger.info(`Client ${id} disconnected`);
            delete clients[id];
        });
    }

    // Initialize server connection handling
    server.on('connection', initializeClient);

    // Return public interface
    return {
        unicast,
        multicast,
        broadcast,
    };
}
