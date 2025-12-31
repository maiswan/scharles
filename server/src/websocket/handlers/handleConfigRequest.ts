import { ClientMessage } from "../../../../shared/ClientMessage";
import { ClientMessageHandlerContext } from "./ClientMessageHandler";
import {  Command, ConfigSnapshot } from "../../../../shared/ServerMessage";
import  { createCommandMessage } from "../../createCommandMessage";
import Config from "../../../config";

function createCommandMessages(clientId: number, config: Config) {
    const output: Command[] = [];
    output.push(createCommandMessage({ clientIds: [clientId], module: "self", action: "set", parameters: ["clientId", clientId] }));

    // Accumlate config
    Object.keys(config.modules).forEach(module => {
        const settings = config.modules[module].public;
        const keys = settings["data"];

        Object.keys(keys).forEach(key => {
            const value = keys[key];
            output.push(createCommandMessage({ clientIds: [clientId], module, action: "set", parameters: [key, value] }));
        });

        const enableCommand = settings.isEnabled ? "enable" : "disable";
        const enableDebugCommand = settings.isDebug ? "enableDebug" : "disableDebug";
        output.push(createCommandMessage({ clientIds: [clientId], module, action: enableCommand, parameters: [] }));
        output.push(createCommandMessage({ clientIds: [clientId], module, action: enableDebugCommand, parameters: [] }));
    });

    return output;
}

export default function handleConfigRequest(clientId: number, message: ClientMessage, context: ClientMessageHandlerContext) {

    const { config, send } = context;

    const commands = createCommandMessages(clientId, config);
    for (const command of commands) {
        context.commandStore.addMessage(command);
    }

    const response: ConfigSnapshot = {
        type: "configSnapshot",
        commands
    }

    send([clientId], response);
}
