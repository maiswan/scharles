import { Command, CommandResponse } from '../../../shared/command';
import { useLogger } from './useLogger';
import { CommandAPI, useCommandBus } from './CommandBus';

// Singletons
let socket: WebSocket | null = null;
let clientId = -1;

function initWebSocket(server: string, logger: ReturnType<typeof useLogger>, dispatchCommand: (commandAPI: CommandAPI) => void) {
    if (socket) {
        return; // WebSocket is already initialized
    }

    socket = new WebSocket(server);

    socket.onopen = () => {
        logger.info('[WebSocket] Connected');
    };

    socket.onclose = () => {
        logger.info('[WebSocket] Disconnected');

        setTimeout(() => {
            logger.info('[WebSocket] Attempting to reconnect...');
            initWebSocket(server, logger, dispatchCommand);
        }, 5000); // Retry after 5 seconds
    };

    socket.onerror = (error) => {
        logger.error('[WebSocket] Error:', error);
    };

    function respond(command: Command, success: boolean, data: unknown | null = null) {
        if (socket?.readyState !== WebSocket.OPEN) {
            logger.warn('[WebSocket] Not connected, unable to respond');
            return;
        }

        const response: CommandResponse = { commandId: command.commandId, clientId, success, data };
        logger.debug('[WebSocket] TX', response);
        socket.send(JSON.stringify(response));
    }

    // Optionally: handle onmessage
    socket.onmessage = (event) => {
        const command: Command = JSON.parse(event.data);
        logger.debug("[WebSocket] RX", command);

        // Intercept clientId
        const { module, action, parameters } = command;
        if (module === "self" && action === "set" && parameters[0] === "clientId") {
            logger.debug(`[WebSocket] clientId = ${parameters[1]}`);
            clientId = parameters[1] as number;
        }

        dispatchCommand({ command, respond });
    }
}

// Custom hook to use a singleton WebSocket
export function useWebSocket(server: string) {
    const { dispatchCommand } = useCommandBus();
    const logger = useLogger();

    initWebSocket(server, logger, dispatchCommand);
}