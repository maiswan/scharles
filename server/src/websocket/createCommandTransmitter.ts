import { logger } from "../app";
import { WebSocketHandler } from "./createWebSocketHandler";

export interface CommandTransmitter {
    transmitFromSingleValue: (value: string) => string,
    transmitFromDelimitedValues: (clientIds: number[], module: string, action: string, parameters?: unknown[] | undefined) => string,
}

export function createCommandTransmitter(wsHandler: WebSocketHandler): CommandTransmitter {
    const transmitFromSingleValue = (value: string) => {
        const parts = value.split(" ");
        const clients = parts[0].split(",").map(Number);
        const module = parts[1];
        const action = parts[2];
        const parameters: unknown[] = [];
        if (parts.length >= 4) { parameters.push(parts[3]); }
        if (parts.length >= 5) { parameters.push(parts.slice(4).join(" ")); }

        logger.info("[commandTx] Parsed command", {
            clients, module, action, parameters
        });
        return transmitFromDelimitedValues(clients, module, action, parameters);
    };

    const transmitFromDelimitedValues = (
        clientIds: number[], 
        module: string, 
        action: string, 
        parameters: unknown[] | undefined = undefined
    ) => {

        // broadcast: clientId = [-1]
        // multicast: clientId = [1,2,3,4]
        // unicast:   clientId = [1]

        // broadcast
        if (clientIds.length === 1 && clientIds[0] === -1) {
            return wsHandler.broadcast(module, action, parameters);
        }

        // multicast and unicast
        return wsHandler.multicast(clientIds, module, action, parameters);
    };


    return {
        transmitFromSingleValue,
        transmitFromDelimitedValues
    };
}