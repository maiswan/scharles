import { Application } from "express";
import { CommandTransmitter } from "../websocket/createCommandTransmitter";
import Endpoint from "./endpoint";
import { CommandStore } from "../createCommandStore";
import { logger } from "../app";

export function createHttpGetHandler(commandTransmitter: CommandTransmitter, app: Application, commandStore: CommandStore): Endpoint {
    app.get('/command/:command', async (req, res) => {
        try {
            const { command } = req.params;

            const commandId = commandTransmitter.transmitFromSingleValue(decodeURIComponent(command));

            setTimeout(() => {
                const response = commandStore.getCommandRecord(commandId);
                res.status(200).json(response);
            }, 500);
        } catch (error) {
            logger.error(error);
            res.status(500).json(error);
        }
    });
    
    return { identifier: "HttpGetHandler" }
}