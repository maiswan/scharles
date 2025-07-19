import { WebSocketServer, WebSocket } from "ws";
import { Config } from "../../config";
import { Server } from "http";
import { Command, CommandRequest, CommandResponse } from "../../../shared/command";
import { randomUUID } from "crypto";
import { logger } from "../app";
import { CommandStore } from "../createCommandStore";

export type WebSocketHandler = ReturnType<typeof createWebSocketHandler>;

export function createWebSocketHandler(httpServer: Server, config: Config, commandStore: CommandStore) {
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

    function initializeClient(ws: WebSocket) {
        const id = getUniqueId();
        clients[id] = ws;
        logger.info(`[webSocketHandler] Client ${id} connected`);

        unicast({ clientIds: [id], module: "self", action: "set", parameters: ["clientId", id]});

        Object.keys(config.modules).forEach(module => {
            const settings = config.modules[module].public;
            const keys = settings["data"];

            Object.keys(keys).forEach(key => {
                const value = keys[key];
                unicast({ clientIds: [id], module, action: "set", parameters: [key, value]});
            });

            const enableCommand = settings.isEnabled ? "enable" : "disable";
            const enableDebugCommand = settings.isDebug ? "enableDebug" : "disableDebug";
            unicast({ clientIds: [id], module, action: enableCommand, parameters: []});
            unicast({ clientIds: [id], module, action: enableDebugCommand, parameters: []});
        });

        ws.addEventListener('message', (event) => {
            const response = JSON.parse((event.data as Buffer).toString()) as CommandResponse;

            logger.debug("[webSocketHandler] RX", response);
            commandStore.addResponse(response);
        })

        ws.addEventListener('close', () => {
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