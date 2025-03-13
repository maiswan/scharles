import { Request, Response } from "express";
import { existsSync } from "fs";
import { pathFetcher } from "../index.ts";

const sendFile = (res: Response, path: string, isRelativePath: boolean) => {
    const options = isRelativePath ? { root: `${__dirname}/../../` } : {};

    res.sendFile(path, options, (error) => {
        if (!error) { return; }

        console.error("Error sending image:", error);
        res.status(500).json({ error: error });
    })
}

export const get = (req: Request, res: Response) => {
    const path = pathFetcher.next();

    // Stream the image to avoid memory issues
    sendFile(res, path, !existsSync(path));
};