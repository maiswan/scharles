import { type Command, type CommandResponse, type CommandRecord, type CommandRequest, getShortCommandId } from "../../shared/command";
import { logger } from "./app";

export type CommandStore = ReturnType<typeof createCommandStore>;

export function createCommandStore() {
    const store = new Map<string, CommandRecord>();

    return {
        addRequest(commandId: string, request: CommandRequest): void {
            logger.debug(`[commandStore] Adding command ${getShortCommandId(commandId)}`);
            store.set(commandId, {
                commandId,
                request,
                responses: {},
                transmitTimestamp: new Date(),
                receiveTimestamp: null
            });
        },

        addResponse(response: CommandResponse): boolean {
            logger.debug(`[commandStore] Adding response from client ${response.clientId} for ${getShortCommandId(response)}`);
            const record = store.get(response.commandId);
            if (!record) {
                logger.warn("[commandStore] Parent command", response.commandId, "does not exist");
                return false;
            }

            record.responses[response.clientId] = response;
            record.receiveTimestamp = new Date();

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
