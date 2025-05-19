import type { Command, CommandResponse, CommandRecord } from "../../shared/command";
import { logger } from "./app";

export interface CommandStore {
    addCommand(clientIds: number[], command: Command): void,
    addResponse(response: CommandResponse): boolean,
    getCommandRecord(comamndId: string): CommandRecord | undefined
}

export function createCommandStore(): CommandStore {
    const store = new Map<string, CommandRecord>();

    return {
        addCommand(clientIds: number[], command: Command): void {
            logger.debug('[commandStore] Adding command', command);
            store.set(command.commandId, {
                command,
                clientIds,
                responses: {},
                transmitTimestamp: new Date(),
                receiveTimestamp: null
            });
        },

        addResponse(response: CommandResponse): boolean {
            logger.debug('[commandStore] Adding response', response);
            const record = store.get(response.commandId);
            if (!record) {
                logger.warn("[commandStore] Parent command", response.commandId, "does not exist");
                return false;
            }

            record.responses[response.clientId] = response;
            record.receiveTimestamp = new Date();

            return true;
        },

        getCommandRecord(id: string): CommandRecord | undefined {
            return store.get(id);
        },

        // getAllCommands(): CommandRecord[] {
        //     return Array.from(store.values());
        // },
        // remove(id: string): boolean {
        //     return store.delete(id);
        // },
        // clear(): void {
        //     store.clear();
        // }
    };
}
