import { Application } from "express";
import InputProcessor from "./InputProcessor";

export default class GetEndpointHandler {
    constructor(inputProcessor: InputProcessor, app: Application) {
        this.initializeEndpoint(inputProcessor, app);
    }

    private initializeEndpoint(inputProcessor: InputProcessor, app: Application) {
        app.get('/:clientId/:component/:action/:parameter?', async (req, res) => {
            try {
                // Extract parameters from req.params
                const {
                    clientId,
                    component,
                    action,
                    parameter,
                } = req.params;

                // Decode URI components to handle %20 and other encodings
                const actualParameters: string[] = [];
                const parameters = decodeURIComponent(parameter || "").split(" ");
                if (parameters.length >= 1) { actualParameters.push(parameters[0]); }
                if (parameters.length >= 2) { actualParameters.push(parameters.slice(1).join(" ")); }

                const response = await inputProcessor.processFromDelimitedValues(clientId, component, action, actualParameters);
                res.status(200).json(response);

            } catch (error) {
                res.status(500).json({
                    message: error.message
                });
            }
        });
    }
}