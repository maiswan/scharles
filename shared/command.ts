export type Command = {
    commandId: string;
    module: string;
    action: string;
    parameter: unknown[];
};

export type CommandResponse = {
    commandId: string;
    clientId: number;
    success: boolean;
    data: unknown;
};

export type CommandRecord = {
    // commandId: string,
    command: Command,
    clientIds: number[];
    responses: Record<number, CommandResponse>,
    transmitTimestamp: Date | null,
    receiveTimestamp: Date | null,
}