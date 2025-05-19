import { RefObject, useEffect } from 'react';
import { Module } from '../modules/types';
import { Command, CommandResponse } from '../../../shared/command';
import { logger } from './useLogger';
import { server } from '../App';

// Singleton WebSocket instance
let socket: WebSocket | null = null;

let clientId = -1;

function initWebSocket(modules: RefObject<Record<string, RefObject<Module | null>>>) {
    if (socket && socket.readyState !== WebSocket.CLOSED) {
        return; // WebSocket is already initialized
    }

    socket = new WebSocket(server);

    socket.onopen = () => { 
        logger.info('[WebSocket] Connected');
        logger.debug('[WebSocket] Available modules: ', Object.keys(modules.current));
    };

    socket.onclose = () => {
        logger.info('[WebSocket] Disconnected');
        
        setTimeout(() => {
            logger.info('[WebSocket] Attempting to reconnect...');
            initWebSocket(modules);
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
        const { module, action, parameter } = command;
        logger.debug("[WebSocket] RX", command);

        if (modules.current[module] === undefined) {
            console.warn(`Module ${module} not found`);
            respond(command, false, `Module ${module} not found`);
            return;
        }

        if (modules.current[module].current === null) {
            console.warn(`Module ${module} not initialized`);
            respond(command, false, `Module ${module} not initialized`);
            return;
        }

        const moduleRef = modules.current[module].current;

        if (module === "self" && action === "set" && parameter[0] === "clientId") {
            logger.debug(`[WebSocket] clientId = ${parameter[1]}`);
            clientId = parameter[1] as number;
        }

        try {
            switch (action) {
                case "enable":
                    moduleRef.enable();
                    respond(command, true, moduleRef.isEnabled);
                    break;
                case "disable":
                    moduleRef.disable();
                    respond(command, true, moduleRef.isEnabled);
                    break;
                case "toggle":
                    moduleRef.toggle();
                    respond(command, true, moduleRef.isEnabled);
                    break;
                case "isEnabled":
                    respond(command, true, moduleRef.isEnabled);
                    break;
                case "set":
                    {
                        const result = moduleRef.set(parameter[0], parameter[1]);
                        respond(command, result, moduleRef.data[parameter[0]]);
                    }
                    break;
                case "get":
                    respond(command, true, moduleRef.data[parameter[0]]);
                    break;
                case "enableDebug":
                    moduleRef.enableDebug();
                    respond(command, true, moduleRef.isDebug);
                    break;
                case "disableDebug":
                    moduleRef.disableDebug();
                    respond(command, true, moduleRef.isDebug);
                    break;
                case "toggleDebug":
                    moduleRef.toggleDebug();
                    respond(command, true, moduleRef.isDebug);
                    break;
                case "isDebug":
                    respond(command, true, moduleRef.isDebug);
                    break;
                default:
                    logger.warn(`Action ${action} not found`);
                    respond(command, false, `Action ${action} not found`);
                    return;
            };
        } catch (error) {
            respond(command, false, error);
        }
    };
}

// Custom hook to use a singleton WebSocket
export function useWebSocket(modules: RefObject<Record<string, RefObject<Module | null>>>, isEnabled: boolean) {
    useEffect(() => {
        if (!isEnabled) { return; }
        initWebSocket(modules);
    }, [isEnabled, modules]);
}