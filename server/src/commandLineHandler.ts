import readline from "readline";
import { Command } from "../../shared/ServerMessage";
import { WebSocketHandler } from "./websocket/createWebSocketHandler";
import { createCommandMessage } from "./createCommandMessage";

export function createCommandLineHandler(wsHandler: WebSocketHandler) {
    const handleInput = (input: string) => {
        
        const parts = input.split(" ");
        const clientIds = parts[0].split(",").map(Number);
        const module = parts[1];
        const action = parts[2];
        const parameters: unknown[] = [];
        if (parts.length >= 4) { parameters.push(parts[3]); }
        if (parts.length >= 5) { parameters.push(parts.slice(4).join(" ")); }

        const command = createCommandMessage({ clientIds, module, action, parameters }) ;
        return wsHandler.send(clientIds, command);
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    rl.on('line', handleInput);
}