import { ILogObj, Logger } from "tslog";
import { type CommandResponse, type CommandRecord, type CommandRequest, getShortCommandId } from "../../shared/command";

export type CommandStore = ReturnType<typeof createCommandStore>;

export function createCommandStore(logger: Logger<ILogObj>, maxCommandHistorySaved: number) {
    const store = new Map<string, CommandRecord>();
    const commandIds: string[] = [];

    return {
        addRequest(commandId: string, request: CommandRequest): void {
            logger.debug(`[commandStore] Adding command ${getShortCommandId(commandId)}`);
            
            commandIds.push(commandId);
            store.set(commandId, {
                commandId,
                request,
                responses: {},
                transmitTimestamp: new Date(),
                receiveTimestamp: null
            });

            // Remove the oldest commands
            if (commandIds.length <= maxCommandHistorySaved) { return; }

            const oldestCommand = commandIds.shift();
            if (!oldestCommand) { return; }

            logger.debug(`[commandStore] Removing oldest command ${getShortCommandId(oldestCommand)}`);
            store.delete(oldestCommand);
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
