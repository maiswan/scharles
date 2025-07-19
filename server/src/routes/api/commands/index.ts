import { Request, Response } from "express";
import { commandStore, commandTx } from "../../../app"
import { CommandRequest } from "../../../../../shared/command";

export const get = (req: Request, res: Response) => {
    const commands = commandStore.getAll();
    res.json(commands);
}

export const del = (req: Request, res: Response) => {
    commandStore.deleteAll();
    res.status(200).send();
}

export const post =
    (req: Request, res: Response) => {
        const request = req.body as CommandRequest;
        if (!request) {
            res.status(422).send();
            return;
        };

        const id = commandTx.transmitFromCommandRequest(request);
        setTimeout(() => {
            const response = commandStore.get(id);
            res.status(200).json(response);
        }, 500);
    }