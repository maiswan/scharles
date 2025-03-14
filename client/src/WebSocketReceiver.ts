import { ModularMethods } from "./components/types";

export default class WebSocketReceiver {
    private server: string;
    private ws: WebSocket;
    private components: React.RefObject<Record<string, React.RefObject<ModularMethods | null>>>;

    private clientId = -1202;

    constructor(server: string, components: React.RefObject<Record<string, React.RefObject<ModularMethods | null>>>) {
        this.components = components;
        this.server = server;
        this.ws = new WebSocket(this.server); // shut the eslint up
        this.reinitialize();
    }

    private reinitialize = () => {
        this.ws = new WebSocket(this.server);
        this.ws.onmessage = this.onmessage;
        this.ws.onerror = this.onerror;
        this.ws.onclose = this.onclose;
    }

    public onclose = () => {
        setTimeout(() => {
            this.reinitialize();
        }, 5000);
    }

    public onerror = () => {
        this.ws.close();
    }

    private respond = (value: unknown) => {
        const json = JSON.stringify({ clientId: this.clientId, response: value });
        this.ws.send(json);
    }

    private onmessage = (event: MessageEvent) => {
        const { module, action, parameter } = JSON.parse(event.data);
        const component = this.components.current[module].current;

        // intercept clientID for later responses
        if (module === "self" && action === "set" && parameter[0] === "clientId") {
            this.clientId = parameter[1] as number;
        }

        switch (action) {
            case "enable":
                component?.enable();
                this.respond(component?.isEnabled());
                break;
            case "disable":
                component?.disable();
                this.respond(component?.isEnabled());
                break;
            case "toggle":
                component?.toggle();
                this.respond(component?.isEnabled());
                break;
            case "isEnabled":
                this.respond(component?.isEnabled());
                break;
            case "set":
                component?.set(parameter[0], parameter[1]);
                this.respond(component?.get(parameter[0]));
                break;
            case "get":
                this.respond(component?.get(parameter[0]));
                break;
            case "enableDebug":
                component?.enableDebug();
                this.respond(component?.isDebugging());
                break;
            case "disableDebug":
                component?.disableDebug();
                this.respond(component?.isDebugging());
                break;
            case "toggleDebug":
                component?.toggleDebug();
                this.respond(component?.isDebugging());
                break;
            case "isDebugging":
                this.respond(component?.isDebugging());
                break;
        };
    }
}