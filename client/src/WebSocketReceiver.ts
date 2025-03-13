import { ModularMethods } from "./components/types";

export default class WebSocketReceiver {
    private ws: WebSocket;
    private components: React.RefObject<Record<string, React.RefObject<ModularMethods | null>>>;

    private clientId = -1202;

    constructor(server: string, components: React.RefObject<Record<string, React.RefObject<ModularMethods | null>>>) {
        this.ws = new WebSocket(server);
        this.components = components;
        this.ws.onmessage = this.handler;
    }

    public close = () => {
        this.ws.close();
    }

    private respond = (value: unknown) => {
        const json = JSON.stringify({ clientId: this.clientId, response: value });
        this.ws.send(json);
    }

    private handler = (event: MessageEvent) => {
        const { module, action, parameter } = JSON.parse(event.data);
        const component = this.components.current[module].current;

        // intercept clientID for later responses
        if (module === "self" && action === "set" && parameter[0] === "clientId") {
            this.clientId = parameter[1] as number;
        }

        switch (action) {
            case "enable":
                component?.enable();
                break;
            case "disable":
                component?.disable();
                break;
            case "toggle":
                component?.toggle();
                break;
            case "set":
                component?.set(parameter[0], parameter[1]);
                break;
            case "get":
                this.respond(component?.get(parameter[0]));
                break;
            case "isEnabled":
                this.respond(component?.isEnabled());
                break;
            case "enableDebug":
                component?.enableDebug();
                break;
            case "disableDebug":
                component?.disableDebug();
                break;
            case "toggleDebug":
                component?.toggleDebug();
                break;
            case "isDebugging":
                this.respond(component?.isDebugging());
                break;
        };
    }
}