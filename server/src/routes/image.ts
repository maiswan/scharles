import { Request, Response } from "express";
import { pathFetcher } from "../index.ts";
import path from "path";

const sendFile = (res: Response, imagePath: string) => {
    const options = path.isAbsolute(imagePath) ? {} : { root: `${__dirname}/../../` };

    res.sendFile(imagePath, options, (error) => {
        if (!error) { return; }

        console.error("Error sending image:", error);
        res.status(500).json({ error: error });
    })
}

export const get = (req: Request, res: Response) => {
    const path = pathFetcher.next();
    sendFile(res, path);
};
