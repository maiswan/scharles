export type ServerMessage =
    | ServerHello
    | AuthAccepted
    | ConfigSnapshot
    | Command;

export interface ServerHello {
    type: "serverHello";
    serverVersion: string;
}

export interface AuthAccepted {
    type: "authAccepted";
}

export interface ConfigSnapshot {
    type: "configSnapshot";
    commands: Command[];
}

export interface Command {
    type: "command";
    commandId: string;
    module: string;
    action: string;
    parameters: unknown[];
}