import { ClientMessage, Command } from '../../../shared/command';
import { useLogger } from './useLogger';
import { useCommandBus } from './CommandBus';
import PackageJson from "../../package.json";
import { INCOMPATIBLE_VERSION } from "../../../shared/codes";
import { useCallback, useEffect, useRef } from 'react';

const VERSION = PackageJson.version;
const RECONNECT_INTERVAL = 5000; // attempt reconnection every x ms;

// Custom hook to use a singleton WebSocket
export function useWebSocket(server: string, jwt: string | null) {
    const { dispatchCommand } = useCommandBus();
    const logger = useLogger();

    const socketRef = useRef<WebSocket | null>(null);
    const clientIdRef = useRef<number | null>(null);
    const reconnectIntervalRef = useRef<number | undefined>(undefined);

    const respond = useCallback((command: Command, success: boolean, data: unknown | null = null) => {
        if (socketRef.current?.readyState !== WebSocket.OPEN) {
            logger.warn('[useWebSocket] Cannot respond as WebSocket is not open');
            return;
        }

        const response: ClientMessage = { type: "CommandResponse", data: { commandId: command.commandId, success, data } };
        logger.debug('[useWebSocket] TX', response);
        socketRef.current.send(JSON.stringify(response));
    }, [logger]);


    // Events
    const authenticate = useCallback((server: string, jwt: string) => {
        if (!socketRef.current) { return; }
        if (socketRef.current?.readyState !== socketRef.current?.OPEN) { return; }

        logger.info(`[useWebSocket] Authenticating with ${server}`);

        const payload: ClientMessage = { type: "Authentication", data: { version: VERSION, jwt } };
        const payloadString = JSON.stringify(payload);

        socketRef.current.send(payloadString);
    }, [logger]);

    const onOpen = useCallback((server: string) => {
        if (jwt == null) { return; }

        logger.info(`[useWebSocket] Connected to ${server}`);

        clearInterval(reconnectIntervalRef.current);
        authenticate(server, jwt);

    }, [authenticate, jwt, logger]);

    const onMessage = useCallback((event: MessageEvent) => {
        const command: Command = JSON.parse(event.data);
        logger.debug("[useWebSocket] RX", command);

        // Intercept clientId
        const { module, action, parameters } = command;
        if (module === "self" && action === "set" && parameters[0] === "clientId") {
            logger.debug(`[useWebSocket] clientId = ${parameters[1]}`);
            clientIdRef.current = parameters[1] as number;
        }

        dispatchCommand({ command, respond });
    }, [dispatchCommand, logger, respond]);

    const onClose = useCallback((event: CloseEvent) => {
        logger.info('[useWebSocket] Connection closed:', event.reason);
        socketRef.current = null;

        if (event.code === INCOMPATIBLE_VERSION) { return; } // do not attempt reconnect 
        if (reconnectIntervalRef.current) { return; } // Already set up for reconnection

        reconnectIntervalRef.current = setInterval(() => {
            logger.info("[useWebSocket] Attempting reconnection");
            initialize();
        }, RECONNECT_INTERVAL);
    }, [logger]);

    const onError = useCallback((error: Event) => {
        logger.error('[useWebSocket] Error', error);
    }, [logger]);

    const initialize = useCallback(() => {

        if (jwt == null) { return; }
        if (socketRef.current) { return; }

        socketRef.current = new WebSocket(server);
        socketRef.current.onopen = () => onOpen(server);
        socketRef.current.onmessage = (e) => onMessage(e);
        socketRef.current.onclose = (e) => onClose(e);
        socketRef.current.onerror = (e) => onError(e);

    }, [jwt, onClose, onError, onMessage, onOpen, server]);

    // Lifecycle
    useEffect(() => {
        if (jwt == null) { return; }
        if (socketRef.current) { return; }

        initialize();
        
    }, [initialize, jwt]);

    // (Re)-authenticate
    useEffect(() => {
        if (jwt != null) { authenticate(server, jwt); }
    }, [authenticate, server, jwt]);
}
