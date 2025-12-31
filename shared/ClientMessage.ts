export type ClientMessageTypes = ClientMessage["type"];

export type ClientMessage =
    | AuthRequest
    | ConfigRequest
    | CommandResult;

export interface AuthRequest {
    type: "authRequest";
    clientVersion: string;
    jwt: string;
}

export interface ConfigRequest {
    type: "configRequest";
}

export interface CommandResult {
    type: "commandResult";
    commandId: string;
    success: boolean;
    data: unknown;
}