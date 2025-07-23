import { Request, Response } from "express";
import { commandStore } from "../../../app"

export const get = (req: Request, res: Response) => {
    const id = req.params["id"];

    const command = commandStore.get(id);
    res.json(command);
}

export const del = (req: Request, res: Response) => {
    const id = req.params["id"];

    commandStore.delete(id);
    res.status(200).send();
}