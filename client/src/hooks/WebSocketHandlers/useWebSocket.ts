import { ClientMessage } from '../../../../shared/ClientMessage';
import { ServerMessage } from '../../../../shared/ServerMessage';
import { useLogger } from '../useLogger';
import { useCommandBus } from '../CommandBus';
import StatusCode from "../../../../shared/StatusCode";
import { useCallback, useEffect, useRef } from 'react';
import { ConfigKey } from '../ConfigurationContext';
import { ServerMessageHandler, ServerMessageHandlerContext } from './handlers/ServerMessageHandler';
import handleConfigSnapshot from './handlers/handleConfigSnapshot';
import handleCommand from './handlers/handleCommand';
import handleAuthAccepted from './handlers/handleAuthAccepted';
import handleServerHello from './handlers/handleServerHello';

const RECONNECT_INTERVAL = 5000; // attempt reconnection every x ms;

const serverMessageHandlers: Partial<Record<ServerMessage["type"], ServerMessageHandler>> = {
    "serverHello": handleServerHello,
    "authAccepted": handleAuthAccepted,
    "configSnapshot": handleConfigSnapshot,
    "command": handleCommand,
}

// Singleton WebSocket
export function useWebSocket(server: string, jwt: string | null, getConfig: (key: ConfigKey) => string, getJwt: () => string | null) {
    const { dispatchCommand } = useCommandBus();
    const logger = useLogger();

    const socketRef = useRef<WebSocket | null>(null);
    // const clientIdRef = useRef<number | null>(null);
    const reconnectIntervalRef = useRef<number | undefined>(undefined);

    const send = useCallback((message: ClientMessage) => {
        if (socketRef.current?.readyState !== WebSocket.OPEN) {
            logger.warn('[useWebSocket] Cannot send message as WebSocket is not open');
            return;
        }

        logger.debug('[useWebSocket] TX', message);
        socketRef.current.send(JSON.stringify(message));
    }, [logger]);


    // Events
    const onOpen = useCallback((server: string) => {
        if (jwt == null) { return; }

        logger.info(`[useWebSocket] Connected to ${server}`);

        clearInterval(reconnectIntervalRef.current);

    }, [jwt, logger]);

    const onMessage = useCallback((event: MessageEvent) => {
        const message = JSON.parse(event.data) as ServerMessage;
        logger.debug("[useWebSocket] RX", message);

        const context: ServerMessageHandlerContext = { getConfig, logger, send, getJwt, dispatchCommand };
        const handler = serverMessageHandlers[message.type];
        if (handler) { handler(message, context); }

    }, [logger, getConfig, send, getJwt, dispatchCommand]);

    const onClose = useCallback((event: CloseEvent) => {
        logger.info('[useWebSocket] Connection closed:', event.reason);
        socketRef.current = null;

        // if server does not want to serve us, do not attempt reconnecting 
        clearInterval(reconnectIntervalRef.current);
        if (event.code === StatusCode.INCOMPATIBLE_VERSION) { return; }

        reconnectIntervalRef.current = window.setInterval(() => {
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
}
