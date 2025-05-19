import { WebSocketServer, WebSocket } from "ws";
import { Config } from "../../config";
import { Server } from "http";
import { Command, CommandResponse } from "../../../shared/command";
import { randomUUID } from "crypto";
import { CommandStore } from "../createCommandStore";
import { logger } from "../app";

export interface WebSocketHandler {
    unicast: (client: number, module: string, action: string, parameter?: unknown[]) => string;
    multicast: (clientIds: number[], module: string, action: string, parameter?: unknown[] | undefined) => string,
    broadcast: (module: string, action: string, parameter?: unknown[] | undefined) => string,
}

export function createWebSocketHandler(httpServer: Server, config: Config, commandStore: CommandStore): WebSocketHandler {
    const clients: Record<number, WebSocket> = {};
    const server = new WebSocketServer({ server: httpServer });

    function getUniqueId(): number {
        let id = 0;
        while (id in clients) { id++; }
        return id;
    }

    function createCommand(module: string, action: string, parameter: unknown[] = []): Command {
        return { commandId: randomUUID(), module, action, parameter };
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

    function unicast(clientId: number, module: string, action: string, parameter: unknown[] = []) {
        const command = createCommand(module, action, parameter);
        commandStore.addCommand([clientId], command);

        logger.debug("[webSocketHandler] TX", command);
        send(clientId, command);
        
        return command.commandId;
    }

    function multicast(clientIds: number[], module: string, action: string, parameter: unknown[] = []) {
        const command = createCommand(module, action, parameter);
        commandStore.addCommand(clientIds, command);

        logger.debug("[webSocketHandler] TX", command);
        clientIds.forEach(x => send(x, command));

        return command.commandId;
    }

    function broadcast(module: string, action: string, parameters: unknown[] = []) {
        const clientIds = Object.keys(clients).map(Number);
        return multicast(clientIds, module, action, parameters);
    }

    function initializeClient(ws: WebSocket) {
        const id = getUniqueId();
        clients[id] = ws;
        logger.info(`[webSocketHandler] Client ${id} connected`);

        unicast(id, "self", "set", ["clientId", id]);

        Object.keys(config.modules).forEach(module => {
            const settings = config.modules[module].public;
            const keys = settings["data"];

            Object.keys(keys).forEach(key => {
                const value = keys[key];
                unicast(id, module, "set", [key, value]);
            });

            const enableCommand = settings.isEnabled ? "enable" : "disable";
            const enableDebugCommand = settings.isDebug ? "enableDebug" : "disableDebug";
            unicast(id, module, enableCommand);
            unicast(id, module, enableDebugCommand);
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