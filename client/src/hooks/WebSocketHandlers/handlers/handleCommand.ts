import { CommandResult } from "../../../../../shared/ClientMessage";
import { Command, ServerMessage } from "../../../../../shared/ServerMessage";
import { ServerMessageHandlerContext } from "./ServerMessageHandler";


export default async function handleCommand(message: ServerMessage, context: ServerMessageHandlerContext) {

    const { send, dispatchCommand } = context;
    const command = message as Command;

    const respond = (commandMessage: Command, success: boolean, data: unknown) => {
        const response: CommandResult = {
            type: "commandResult",
            commandId: commandMessage.commandId,
            success,
            data,
        }
        send(response);
    }

    dispatchCommand({ commandMessage: command, respond });
}