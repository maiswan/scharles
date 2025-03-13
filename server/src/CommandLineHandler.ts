import readline from "readline";
import WebSocketHandler from "./WebSocketHandler";

export default class CommandLineHandler {
    private wsh: WebSocketHandler;

    constructor(wsh: WebSocketHandler) {
        this.wsh = wsh;
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        }); 
        rl.on('line', this.handleInput);
    }

    private handleInput = (input: string) => {
        const parts = input.split(" ");
        const clientNumber = Number(parts[0]);
        const module = parts[1]
        const action = parts[2]
        const parameters: unknown[] = [];
        if (parts.length >= 4) { parameters.push(parts[3]); }
        if (parts.length >= 5) { parameters.push(parts.slice(4).join(" ")); }
        
        if (clientNumber === -1) {
            const responses = this.wsh.broadcast(module, action, parameters);
            this.readbacks(responses);
            return;
        }

        const response = this.wsh.send(clientNumber, module, action, parameters);
        this.readback(response);
    }

    private readbacks = async (responses: (Promise<unknown> | undefined)[]) => {
        responses.forEach(this.readback);
    }

    private readback = async (response: (Promise<unknown> | undefined)) => {
        if (response === undefined) { return; }

        const content = JSON.parse(((await response) as Buffer).toString());
        console.log(content);
    }
}