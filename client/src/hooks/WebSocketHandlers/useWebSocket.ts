import { ClientMessage } from '../../../../shared/ClientMessage';
import { ServerMessage } from '../../../../shared/ServerMessage';
import { useLogger } from '../useLogger';
import StatusCode from "../../../../shared/StatusCode";
import { useContext, useEffect, useRef } from 'react';
import { ConfigurationContext } from '../ConfigurationContext';
import { ServerMessageHandler, ServerMessageHandlerContext } from './handlers/ServerMessageHandler';
import handleConfigSnapshot from './handlers/handleConfigSnapshot';
import handleCommand from './handlers/handleCommand';
import handleAuthAccepted from './handlers/handleAuthAccepted';
import handleServerHello from './handlers/handleServerHello';
import useNonNullContext from '../useNonNullContext';
import { AuthenticationContext } from '../AuthenticationContext';
import { CommandContext } from '../CommandBus';

const RECONNECT_INTERVAL = 5000; // attempt reconnection every x ms;

const serverMessageHandlers: Partial<Record<ServerMessage["type"], ServerMessageHandler>> = {
    "serverHello": handleServerHello,
    "authAccepted": handleAuthAccepted,
    "configSnapshot": handleConfigSnapshot,
    "command": handleCommand,
}

export default function useWebSocket() {
    const { dispatchCommand } = useContext(CommandContext);
    const { config } = useNonNullContext(ConfigurationContext);
    const token = useContext(AuthenticationContext);
    const logger = useLogger();

    const server = config['maiswan/scharles-client.server'];
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectIntervalRef = useRef<number | undefined>(undefined);
    const hasInitializedRef = useRef(false);

    const send = (message: ClientMessage) => {
        if (socketRef.current?.readyState !== WebSocket.OPEN) {
            logger.warn('[useWebSocket] Cannot send message as WebSocket is not open');
            return;
        }

        logger.debug('[useWebSocket] TX', message);
        socketRef.current.send(JSON.stringify(message));
    };
    
    // Events
    const onOpen = (server: string) => {
        logger.info(`[useWebSocket] Opened connection to ${server}`);
        hasInitializedRef.current = true;
        clearInterval(reconnectIntervalRef.current);
    };

    const onMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data) as ServerMessage;
        logger.debug("[useWebSocket] RX", message);

        const context: ServerMessageHandlerContext = { config, logger, send, token, dispatchCommand };
        const handler = serverMessageHandlers[message.type];
        if (handler) { handler(message, context); }
    };
    
    const onClose = (event: CloseEvent) => {
        logger.info('[useWebSocket] Connection closed:', event.reason);
        socketRef.current = null;

        // if server does not want to serve us, do not attempt reconnecting 
        clearInterval(reconnectIntervalRef.current);
        if (event.code === StatusCode.INCOMPATIBLE_VERSION) { return; }

        reconnectIntervalRef.current = window.setInterval(() => {
            logger.info("[useWebSocket] Attempting reconnection");
            initialize(token);
        }, RECONNECT_INTERVAL);
    };

    const onError = (error: Event) => {
        logger.error('[useWebSocket] Error', error);
    };

    const initialize = (token: string | undefined) => {
        if (hasInitializedRef.current) { return; }
        if (token == null) { return; }

        socketRef.current = new WebSocket(server);
        socketRef.current.onopen = () => onOpen(server);
        socketRef.current.onmessage = (e) => onMessage(e);
        socketRef.current.onclose = (e) => onClose(e);
        socketRef.current.onerror = (e) => onError(e);
    };

    // Lifecycle
    useEffect(() => initialize(token), [token]);
}
