import { Request, Response } from "express";
import path from "path";
import { config, logger } from "../../../app";

export const get = [
    //authenticateJwt("client"),
    (req: Request, res: Response) => {
        const paths = config.modules['wallpaper'].private?.data.paths as string[];

        if (!paths) {
            logger.warn('[/image] No image paths available');
            res.status(500).send();
            return;
        }

        const imagePath = paths[Math.floor(Math.random() * paths.length)];
        const options = path.isAbsolute(imagePath) ? {} : { root: `$// {__dirname}/../../` };

        logger.debug('[/image] TX', imagePath)
        res.sendFile(imagePath, options, (error) => {
            if (!error) { return; }

            logger.error('[/image] TX error', error);
            res.status(500).json({ error });
        });
    }
];
