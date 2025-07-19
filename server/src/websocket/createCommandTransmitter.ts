import { logger } from "../app";
import { WebSocketHandler } from "./createWebSocketHandler";
import { Command, CommandRequest } from "../../../shared/command";

export type CommandTransmitter = ReturnType<typeof createCommandTransmitter>;

export function createCommandTransmitter(wsHandler: WebSocketHandler) {
    const transmitFromCommandRequest = (request: CommandRequest) => {
        // broadcast: clientIds = [-1]
        // multicast: clientIds = [1,2,3,4]
        // unicast:   clientIds = [1]

        // broadcast
        if (request.clientIds.length === 1 && request.clientIds[0] === -1) {
            return wsHandler.broadcast(request);
        }

        // multicast and unicast
        return wsHandler.multicast(request);
    }

    const transmitFromString = (value: string) => {
        const parts = value.split(" ");
        const clientIds = parts[0].split(",").map(Number);
        const module = parts[1];
        const action = parts[2];
        const parameters: unknown[] = [];
        if (parts.length >= 4) { parameters.push(parts[3]); }
        if (parts.length >= 5) { parameters.push(parts.slice(4).join(" ")); }

        const request: CommandRequest = { clientIds, module, action, parameters };
        return transmitFromCommandRequest(request);
    };

    return {
        transmitFromString,
        transmitFromCommandRequest
    };
}