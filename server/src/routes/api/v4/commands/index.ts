import { Request, Response } from "express";
import { CommandRequest } from "../../../../CommandRequest";
import verifyJwtHeader from "../../../../middlewares/verifyJwtHeader";
import { createCommandMessage } from "../../../../createCommandMessage";
import { Role } from "../../../../Roles";

export const get = [
    verifyJwtHeader(Role.Admin),
    (req: Request, res: Response) => {
        const { commandStore } = req.app.locals;
        const commands = commandStore.getAll();
        res.json(commands);
    }
]

export const del = [
    verifyJwtHeader(Role.Admin),
    (req: Request, res: Response) => {
        const { commandStore } = req.app.locals;
        commandStore.deleteAll();
        res.status(200).send();
    }
]

export const post = [
    verifyJwtHeader(Role.Controller),
    (req: Request, res: Response) => {
        const request = req.body as CommandRequest;
        if (!request) {
            res.status(422).send();
            return;
        };

        const { commandStore, wsHandler } = req.app.locals;

        const commandMessage = createCommandMessage(request);
        commandStore.addMessage(commandMessage);
        wsHandler.send(request.clientIds, commandMessage);
        
        setTimeout(() => {
            const response = commandStore.get(commandMessage.commandId);
            res.status(200).json(response);
        }, 500);
    }
]