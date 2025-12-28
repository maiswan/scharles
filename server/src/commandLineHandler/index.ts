import readline from "readline";
import { CommandRequest } from "../../../shared/command";
import { WebSocketHandler } from "../websocket/createWebSocketHandler";

export function createCommandLineHandler(wsHandler: WebSocketHandler) {
    const handleInput = (input: string) => {
        
        const parts = input.split(" ");
        const clientIds = parts[0].split(",").map(Number);
        const module = parts[1];
        const action = parts[2];
        const parameters: unknown[] = [];
        if (parts.length >= 4) { parameters.push(parts[3]); }
        if (parts.length >= 5) { parameters.push(parts.slice(4).join(" ")); }

        const request: CommandRequest = { clientIds, module, action, parameters };
        return wsHandler.sendToClient(request);
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    rl.on('line', handleInput);
}