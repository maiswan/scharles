import { Application } from "express";
import WebSocketHandler from "./WebSocketHandler";

export default class GetEndpointHandler {
    constructor(app: Application, wsh: WebSocketHandler) {
        this.initializeEndpoint(app, wsh);
    }

    private initializeEndpoint(app: Application, wsh: WebSocketHandler) {

        app.get('/:clientId/:module/:action/:parameter1?/:parameterRest?', async (req, res) => {
            try {
                // Extract parameters from req.params
                const {
                    clientId,
                    module,
                    action,
                    parameter1,
                    parameterRest
                } = req.params;

                // Decode URI components to handle %20 and other encodings
                const parameters: string[] = []
                if (parameter1) { parameters.push(parameter1); }
                if (parameterRest) { parameters.push(decodeURIComponent(parameterRest)); }

                const toJson = (x: unknown) => {
                    return JSON.parse((x as Buffer).toString());
                } 

                const client = Number(clientId);
                if (client === -1) {
                    const responses = wsh.broadcast(module, action, parameters);
                    const contents = (await Promise.all(responses)).map(toJson);
                    res.status(200).json(contents);
                    return;
                }

                const response = await wsh.send(client, module, action, parameters);
                const content = toJson(await response);
                res.status(200).json(content);

            } catch (error) {
                res.status(500).json({
                    error: 'Internal server error',
                    message: error.message
                });
            }
        });
    }
}