// admin/controller -> server
export type CommandRequest = {
    // admins/controllers need not specify a commandId (as the server generates one)
    clientIds: number[],
    module: string;
    action: string;
    parameters: unknown[];
}
