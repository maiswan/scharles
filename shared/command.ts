export type Command = {
    // don't expose clientIds to individual clients as they shouldn't know who else the server is serving
    commandId: string;
    module: string;
    action: string;
    parameters: unknown[];
};

export type CommandRequest = {
    clientIds: number[],
    module: string;
    action: string;
    parameters: unknown[];
}

export type CommandResponse = {
    commandId: string;
    clientId: number;
    success: boolean;
    data: unknown;
};

export type CommandRecord = {
    commandId: string,
    request: CommandRequest,
    responses: Record<number, CommandResponse>,
    transmitTimestamp: Date | null,
    receiveTimestamp: Date | null,
}

export function getShortCommandId(value: string | Command | CommandResponse | CommandRecord) {
    let id = typeof value === "string"
        ? value as string
        : value.commandId;

    return `#${id.substring(0, 8)}`;
}