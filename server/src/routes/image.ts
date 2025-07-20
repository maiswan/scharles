import { Request, Response } from "express";
import { config, logger } from "../app";
import path from "path";

const sendFile = (res: Response, imagePath: string) => {
    const absolutePath = path.resolve(__dirname, imagePath);

    logger.debug('[/image] TX', absolutePath)
    res.sendFile(absolutePath, {}, (error) => {
        if (!error) { return; }

        logger.error('[/image] TX error', error);
        res.status(500).json({ error: error });
    })
}

export const get = (req: Request, res: Response) => {
    const paths = config.modules['wallpaper'].private?.data.paths as string[];

    if (!paths) {
        logger.warn('[/image] No image paths available');
        return;
    }

    const path = getRandomImage(paths);
    sendFile(res, path);
};


export default function getRandomImage(paths: string[]) {
    const randomIndex = Math.floor(Math.random() * paths.length);
    return paths[randomIndex];
}
