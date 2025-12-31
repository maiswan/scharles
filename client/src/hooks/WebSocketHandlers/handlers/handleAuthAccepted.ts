import { ConfigRequest } from "../../../../../shared/ClientMessage";
import { ServerMessage } from "../../../../../shared/ServerMessage";
import { ServerMessageHandlerContext } from "./ServerMessageHandler";


export default async function handleAuthAccepted(_message: ServerMessage, context: ServerMessageHandlerContext) {

    const { send } = context;
    
    const response: ConfigRequest = {
        type: "configRequest"
    };

    send(response);
}