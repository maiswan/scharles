import { Request, Response } from "express";
import authenticateJwt from "../../../../middlewares/jwt";

export const get = [
    authenticateJwt("admin"),
    (req: Request, res: Response) => {
        const id = req.params["id"];
        const commandStore = req.app.locals.commandStore;

        const command = commandStore.get(id);
        res.json(command);
    }
]

export const del = [
    authenticateJwt("admin"),
    (req: Request, res: Response) => {
        const id = req.params["id"];
        const commandStore = req.app.locals.commandStore;

        commandStore.delete(id);
        res.status(200).send();
    }
]