import { WebSocketServer, WebSocket, Data } from "ws";
import Config from "../../config";
import { Server } from "http";
import { ClientMessage, ClientMessageTypes, Command, CommandRequest } from "../../../shared/command";
import { randomUUID } from "crypto";
import { CommandStore } from "../createCommandStore";
import { Logger, ILogObj } from "tslog";
import { ClientMessageHandler, ClientMessageHandlerContext } from "./ClientMessageHandler";
import StatusCode from "../../../shared/codes";

export type WebSocketHandler = ReturnType<typeof createWebSocketHandler>;

type ClientEntry = {
    id: number,
    socket: WebSocket,
    version: string,
    timeout: NodeJS.Timeout,
}

export function createWebSocketHandler(logger: Logger<ILogObj>, httpServer: Server, config: Config, commandStore: CommandStore) {
    let nextClientId = 0;
    const clients: Record<number, ClientEntry> = {};
    const server = new WebSocketServer({ server: httpServer });
    const handlers: Partial<Record<ClientMessageTypes, ClientMessageHandler>> = {};

    function registerMessageHandler(messageType: ClientMessageTypes, handler: ClientMessageHandler) {
        handlers[messageType] = handler;
    }

    function addClient(clientId: number, socket: WebSocket, version: string, timeoutDuration: number) {
        clearTimeout(clients[clientId]?.timeout);
        clients[clientId] = {
            id: clientId,
            socket,
            version,
            timeout: setTimeout(() => removeClient(clientId, StatusCode.UNAUTHENTICATED), timeoutDuration)
        };
    }

    function removeClient(id: number, code: StatusCode) {
        clients[id]?.socket.close(code);
        clearTimeout(clients[id]?.timeout);
        delete clients[id]; 
        logger.info(`[webSocketHandler] Removing client ${id} for ${code}`);
    }

    function includes(clientId: number) {
        return clients[clientId] != null;
    } 

    function createCommand(request: CommandRequest): Command {
        // Strip clientIds so clients don't know about each other
        return {
            commandId: randomUUID(),
            module: request.module,
            action: request.action,
            parameters: request.parameters
        };
    }

    function send(request: CommandRequest) {
        // if broadcast, populate clientIds with all connected clients
        if (request.clientIds.length === 1 && request.clientIds[0] === -1){
            const everyone = Object.keys(clients).map(Number);
            request.clientIds = everyone;
        }

        const command = createCommand(request);
        const commandString = JSON.stringify(command);
        commandStore.addRequest(command.commandId, request);

        logger.debug("[webSocketHandler] TX", command);

        for (const clientId of request.clientIds) {
            if (!clients[clientId]) {
                logger.warn(`[webSocketHandler] Client ${clientId} does not exist`);
                continue;
            }

            clients[clientId].socket.send(commandString);
        }

        return command.commandId;
    }

    function acceptConnection(webSocket: WebSocket) {
        let clientId = nextClientId++;

        webSocket.on('message', (data: Data) => {
            if (data == null) { return; }

            const message = JSON.parse((data as Buffer).toString()) as ClientMessage;
            logger.debug(`[webSocketHandler] RX ${message.type} from client ${clientId}`);

            const context: ClientMessageHandlerContext = {
                logger, config, commandStore, webSocket, includes, addClient, removeClient, send
            };
            const handler = handlers[message.type];
            if (handler) { handler(clientId, message, context); }
        })

        webSocket.on('close', () => removeClient(clientId, StatusCode.NORMAL));
    }

    // Initialize server connection handling
    server.on('connection', acceptConnection);
    return { send, includes, addClient, removeClient, registerMessageHandler };
}
