import { ILogObj, Logger } from "tslog";
import { CommandResult } from "../../shared/ClientMessage";
import { Command } from "../../shared/ServerMessage";

export type CommandStore = ReturnType<typeof createCommandStore>;

type ReceivedMessageEntry = {
    result: CommandResult,
    timestamp: Date
}

type CommandRecord = {
    commandId: string,
    timestamp: Date | null,
    sentMessage: Command,
    receivedMessages: Record<number, ReceivedMessageEntry>,
}

function getShortCommandId(value: string | CommandResult | CommandRecord | Command) {
    let id = typeof value === "string"
        ? value as string
        : value.commandId;

    return `#${id.substring(0, 8)}`;
}

export default function createCommandStore(logger: Logger<ILogObj>, maxCommandHistorySaved: number) {
    const store = new Map<string, CommandRecord>();
    const commandIds: string[] = [];

    return {
        addMessage(message: Command): void {
            const commandId = message.commandId;
            logger.debug(`[commandStore] Adding command ${getShortCommandId(commandId)}`);
            
            commandIds.push(commandId);
            store.set(commandId, {
                commandId,
                sentMessage: message,
                receivedMessages: {},
                timestamp: new Date(),
            });

            // Remove the oldest commands
            if (commandIds.length <= maxCommandHistorySaved) { return; }

            const oldestCommand = commandIds.shift();
            if (!oldestCommand) { return; }

            logger.debug(`[commandStore] Removing oldest command ${getShortCommandId(oldestCommand)}`);
            store.delete(oldestCommand);
        },

        addResult(clientId: number, result: CommandResult): boolean {
            logger.debug(`[commandStore] Adding response from client ${clientId} for ${getShortCommandId(result)}`);
            const record = store.get(result.commandId);
            if (!record) {
                logger.warn("[commandStore] Parent command", result.commandId, "does not exist");
                return false;
            }

            record.receivedMessages[clientId] = {
                result,
                timestamp: new Date(),
            }

            return true;
        },

        get(id: string): CommandRecord | undefined {
            return store.get(id);
        },

        getAll(): CommandRecord[] {
            return Array.from(store.values());
        },

        delete(id: string): boolean {
            return store.delete(id);
        },

        deleteAll(): void {
            store.clear();
        }
    };
}
