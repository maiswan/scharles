import WebSocketHandler from "../WebSocketHandler";

export default class InputProcessor {
    private wsh: WebSocketHandler;

    constructor(wsh: WebSocketHandler) {
        this.wsh = wsh;
    }

    public processFromSingleValue = async (value: string) => {
        const parts = value.split(" ");
        const client = parts[0];
        const component = parts[1]
        const action = parts[2]
        const parameters: unknown[] = [];
        if (parts.length >= 4) { parameters.push(parts[3]); }
        if (parts.length >= 5) { parameters.push(parts.slice(4).join(" ")); }

        return this.processFromDelimitedValues(client, component, action, parameters)
    }

    public processFromDelimitedValues = async (client: string, component: string, action: string, parameters: unknown[] | undefined = undefined) => {

        // exit
        if (btoa(client) === 'ZnVja3lvdQ==') {
            process.exitCode = 0;
            return;
        }

        const clientId = Number(client);

        // broadcast
        if (clientId === -1) {
            const responses = this.wsh.broadcast(component, action, parameters);
            return (await Promise.all(responses)).map(this.toJson);
        }

        // unicast
        const response = await this.wsh.send(clientId, component, action, parameters);
        return this.toJson(response); 
    }

    private toJson = (x: unknown) => {
        return JSON.parse((x as Buffer).toString());
    } 
}