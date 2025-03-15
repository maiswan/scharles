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
        const { component, action, parameter } = JSON.parse(event.data);
        const componentRef = this.components.current[component].current;

        // intercept clientID for later responses
        if (component === "self" && action === "set" && parameter[0] === "clientId") {
            this.clientId = parameter[1] as number;
        }

        switch (action) {
            case "enable":
                componentRef?.enable();
                this.respond(componentRef?.isEnabled());
                break;
            case "disable":
                componentRef?.disable();
                this.respond(componentRef?.isEnabled());
                break;
            case "toggle":
                componentRef?.toggle();
                this.respond(componentRef?.isEnabled());
                break;
            case "isEnabled":
                this.respond(componentRef?.isEnabled());
                break;
            case "set":
                componentRef?.set(parameter[0], parameter[1]);
                this.respond(componentRef?.get(parameter[0]));
                break;
            case "get":
                this.respond(componentRef?.get(parameter[0]));
                break;
            case "enableDebug":
                componentRef?.enableDebug();
                this.respond(componentRef?.isDebugging());
                break;
            case "disableDebug":
                componentRef?.disableDebug();
                this.respond(componentRef?.isDebugging());
                break;
            case "toggleDebug":
                componentRef?.toggleDebug();
                this.respond(componentRef?.isDebugging());
                break;
            case "isDebugging":
                this.respond(componentRef?.isDebugging());
                break;
        };
    }
}