import { WebSocketServer, WebSocket, Data } from "ws";
import Config from "../../config";
import { Server } from "http";
import { randomUUID } from "crypto";
import { CommandStore } from "../createCommandStore";
import { Logger, ILogObj } from "tslog";
import { ClientMessageHandler, ClientMessageHandlerContext } from "./handlers/ClientMessageHandler";
import StatusCode from "../../../shared/StatusCode";
import { ServerMessage, ServerHello } from "../../../shared/ServerMessage";
import { ClientMessage, ClientMessageTypes as ClientMessageType } from "../../../shared/ClientMessage";
import PackageJson from "../../package.json";

export type WebSocketHandler = ReturnType<typeof createWebSocketHandler>;

type ClientEntry = {
    clientId: number,
    socket: WebSocket,
    version: string,
}

export function createWebSocketHandler(logger: Logger<ILogObj>, httpServer: Server, config: Config, commandStore: CommandStore) {
    let nextClientId = 0;
    const clients: Record<number, ClientEntry> = {};
    const server = new WebSocketServer({ server: httpServer });
    const handlers: Partial<Record<ClientMessageType, ClientMessageHandler>> = {};

    function registerMessageHandler(messageType: ClientMessageType, handler: ClientMessageHandler) {
        handlers[messageType] = handler;
    }

    function addClient(clientId: number, socket: WebSocket, version: string) {
        clients[clientId] = {
            clientId,
            socket,
            version,
        };
    }

    function removeClient(id: number, code: StatusCode) {
        clients[id]?.socket.close(code);
        delete clients[id]; 
        logger.info(`[webSocketHandler] Removing client ${id} for ${code}`);
    }

    function includes(clientId: number) {
        return clients[clientId] != null;
    } 

    function send(clientIds: number[], message: ServerMessage) {
        // if broadcast, populate clientIds with all connected clients
        if (clientIds.length === 1 && clientIds[0] === -1){
            const everyone = Object.keys(clients).map(Number);
            clientIds = everyone;
        }

        const messageString = JSON.stringify(message);
        logger.debug("[webSocketHandler] TX", message);

        for (const clientId of clientIds) {
            if (!clients[clientId]) {
                logger.warn(`[webSocketHandler] Client ${clientId} does not exist`);
                continue;
            }

            clients[clientId].socket.send(messageString);
        }
    }

    function acceptConnection(webSocket: WebSocket) {
        
        let clientId = nextClientId++;

        // Identify ourselves on connection attempt
        const hello: ServerHello = { type: "serverHello", serverVersion: PackageJson.version };
        webSocket.send(JSON.stringify(hello));


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
