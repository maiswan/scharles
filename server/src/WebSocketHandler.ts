import { WebSocketServer, WebSocket } from "ws";
import { Environment } from "../env";
import { Server } from "http";

export default class WebSocketHandler {
    private env: Environment;
    private clients: Record<number, WebSocket> = {};
    private server: WebSocketServer;
    private isDebug = false;

    constructor(httpServer: Server, env: Environment, isDebug = false) {
        this.server = new WebSocketServer({ server: httpServer });
        this.env = env;
        this.isDebug = isDebug;
        this.server.on('connection', (ws) => this.initializeClient(ws));
    }

    public send(client: number, module: string, action: string, parameter: unknown[] | undefined = undefined, isDebug = this.isDebug) {
        if (!(client in this.clients)) { return; } 
        const destination = this.clients[client];

        const json = JSON.stringify({ module: module, action: action, parameter: parameter });
        if (isDebug) { console.log(client, json); }

        return new Promise((resolve) => {
            destination.send(json);
            destination.removeAllListeners("message");
            destination.once('message', (event) => resolve(event))
        });
    }

    public broadcast(module: string, action: string, parameter: unknown[] | undefined = undefined, isDebug = this.isDebug) {
        const promises: Promise<unknown>[] = [];

        Object
            .keys(this.clients)
            .forEach(x => {
                const promise = this.send(x as unknown as number, module, action, parameter, isDebug);
                if (promise !== undefined) { promises.push(promise); }
            });

        return promises;
    }

    private getUniqueId(): number {
        let id = 0;
        while (id in this.clients) { id++; }
        return id;
    }

    private initializeClient(ws: WebSocket) {
        const id = this.getUniqueId();
        this.clients[id] = ws;
        console.log(`Client ${id} connected`);

        Object.keys(this.env.Public).forEach(x => {
            const component = x;
            const settings = this.env.Public[x];
            const keys = settings["data"]
    
            Object.keys(keys).forEach(key => {
                const value = keys[key];
                this.send(id, component, "set", [key, value], true);
            })

            const enableCommand = settings.isEnabled ? "enable" : "disable";
            const enableDebugCommand = settings.isDebug ? "enableDebug" : "disableDebug";
            this.send(id, component, enableCommand);
            this.send(id, component, enableDebugCommand);
            this.send(id, "self", "set", ["clientId", id]);
        })

        ws.addEventListener('close', () => {
            console.log(`Client ${id} disconnected`);
            delete this.clients[id];
        })
    }
}