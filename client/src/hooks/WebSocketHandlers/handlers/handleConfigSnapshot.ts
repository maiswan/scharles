import { CommandResult } from "../../../../../shared/ClientMessage";
import { Command, ConfigSnapshot, ServerMessage } from "../../../../../shared/ServerMessage";
import { ServerMessageHandlerContext } from "./ServerMessageHandler";


export default async function handleConfigSnapshot(message: ServerMessage, context: ServerMessageHandlerContext) {

    const { send, dispatchCommand } = context;
    const { commands } = message as ConfigSnapshot;

    const respond = (commandMessage: Command, success: boolean, data: unknown) => {
        const response: CommandResult = {
            type: "commandResult",
            commandId: commandMessage.commandId,
            success,
            data,
        }
        send(response);
    }

    for (const command of commands) {
        dispatchCommand({ commandMessage: command, respond });
    }
}