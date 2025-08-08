import { Request, Response } from "express";
import { commandStore } from "../../../../app"
import authenticateJwt from "../../../../middlewares/jwt";

export const get = [
    authenticateJwt("admin"),
    (req: Request, res: Response) => {
        const id = req.params["id"];

        const command = commandStore.get(id);
        res.json(command);
    }
]

export const del = [
    authenticateJwt("admin"),
    (req: Request, res: Response) => {
        const id = req.params["id"];

        commandStore.delete(id);
        res.status(200).send();
    }
]