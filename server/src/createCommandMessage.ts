import { randomUUID } from "crypto";
import { CommandRequest } from "./CommandRequest";
import { Command } from "../../shared/ServerMessage";

export function createCommandMessage(request: CommandRequest): Command {
    return {
        type: "command",
        commandId: randomUUID(),
        module: request.module,
        action: request.action,
        parameters: request.parameters
    };
}