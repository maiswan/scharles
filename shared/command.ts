// controller -> server
export type CommandRequest = {
    clientIds: number[],
    module: string;
    action: string;
    parameters: unknown[];
}

// server -> client
export type Command = {
    // don't expose clientIds to individual clients as they shouldn't know who else the server is serving
    commandId: string;
    module: string;
    action: string;
    parameters: unknown[];
};

// client -> server
export type ClientMessage =
    | { type: "CommandResponse", data: CommandResponseMessage }
    | { type: "Authentication", data: AuthenticationMessage };

export type CommandResponseMessage = {
    commandId: string;
    success: boolean;
    data: unknown;
};

export type AuthenticationMessage = {
    version: string;
    jwt: string;
}

// server
export type CommandRecord = {
    commandId: string,
    request: CommandRequest,
    responses: Record<number, CommandResponseMessage>,
    transmitTimestamp: Date | null,
    receiveTimestamp: Date | null,
}

export function getShortCommandId(value: string | Command | CommandResponseMessage | CommandRecord) {
    let id = typeof value === "string"
        ? value as string
        : value.commandId;

    return `#${id.substring(0, 8)}`;
}