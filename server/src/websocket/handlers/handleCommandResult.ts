import { ClientMessage, CommandResult } from "../../../../shared/ClientMessage";
import { ClientMessageHandlerContext } from "./ClientMessageHandler";

export default function handleCommandResult(clientId: number, message: ClientMessage, context: ClientMessageHandlerContext) {
    const data = message as CommandResult;
    context.commandStore.addResult(clientId, data);
}
