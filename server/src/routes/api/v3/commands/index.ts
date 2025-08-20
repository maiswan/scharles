import { Request, Response } from "express";
import { CommandRequest } from "../../../../../../shared/command";
import authenticateJwt, { Role } from "../../../../middlewares/jwt";

export const get = [
    authenticateJwt(Role.Admin),
    (req: Request, res: Response) => {
        const { commandStore } = req.app.locals;
        const commands = commandStore.getAll();
        res.json(commands);
    }
]

export const del = [
    authenticateJwt(Role.Admin),
    (req: Request, res: Response) => {
        const { commandStore } = req.app.locals;
        commandStore.deleteAll();
        res.status(200).send();
    }
]

export const post = [
    authenticateJwt(Role.Controller),
    (req: Request, res: Response) => {
        const request = req.body as CommandRequest;
        if (!request) {
            res.status(422).send();
            return;
        };

        const { commandTx, commandStore } = req.app.locals;

        const id = commandTx.transmitFromCommandRequest(request);
        setTimeout(() => {
            const response = commandStore.get(id);
            res.status(200).json(response);
        }, 500);
    }
]