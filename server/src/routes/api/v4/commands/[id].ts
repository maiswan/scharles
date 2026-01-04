import { Request, Response } from "express";
import verifyJwtHeader from "../../../../middlewares/verifyJwtHeader";
import { Role } from "../../../../Roles";

export const get = [
    verifyJwtHeader(Role.Admin),
    (req: Request, res: Response) => {
        const id = req.params["id"];
        const commandStore = req.app.locals.commandStore;

        const command = commandStore.get(id);
        res.json(command);
    }
]

export const del = [
    verifyJwtHeader(Role.Admin),
    (req: Request, res: Response) => {
        const id = req.params["id"];
        const commandStore = req.app.locals.commandStore;

        commandStore.delete(id);
        res.status(200).send();
    }
]