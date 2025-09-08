import { Request, Response } from "express";
import path from "path";
import authenticateJwt, { Role } from "../../../middlewares/jwt";

export const post = [
    authenticateJwt(Role.Client),
    (req: Request, res: Response) => {
        const { config, logger } = req.app.locals;
        const paths = config.modules['wallpaper'].private?.data.paths as string[];

        if (!paths) {
            logger.warn('[/image] No image paths available');
            res.status(500).send();
            return;
        }

        const imagePath = path.resolve(paths[Math.floor(Math.random() * paths.length)]);

        logger.debug('[/image] TX', imagePath)
        res.sendFile(imagePath, (error) => {
            if (!error) { return; }

            logger.error('[/image] TX error', error);
            res.status(500).json(error);
        });
    }
];
