import { ClientMessage, CommandResponseMessage } from "../../../shared/command";
import { ClientMessageHandlerContext } from "./ClientMessageHandler";

export default function commandResponseHandler(clientId: number, message: ClientMessage, context: ClientMessageHandlerContext) {
    const data = message.data as CommandResponseMessage;
    context.commandStore.addResponse(clientId, data);
}
