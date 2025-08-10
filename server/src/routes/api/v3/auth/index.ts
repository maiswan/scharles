import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { JwtRolePaylaod, Role } from "../../../../middlewares/jwt";

// Allow users to authenticate themselves with an API key
// Return them a JWT on success
export const post = (req: Request, res: Response) => {
    const { apiKey } = req.body;
    const { logger, config } = req.app.locals;

    if (!apiKey) {
        logger.debug("[JWT] No API key to authenticate");
        return res.status(400).json({ error: "API key required" });
    }

    let role: Role | null = null;

    // if (config.server.keys.clients.includes(apiKey)) { role = "client"; }
    if (role == null && config.server.keys.controllers.includes(apiKey)) { role = "controller"; }
    if (role == null && config.server.keys.admins.includes(apiKey)) { role = "admin"; }

    if (!role) {
        logger.debug(`[JWT] Invalid API key ending in ${apiKey.slice(-4)}`);
        return res.status(401).json({ error: "Invalid API key" });
    }

    const jwtPayload: JwtRolePaylaod = {
        role,
        issuedAt: Date.now()
    };

    const token = jwt.sign(jwtPayload, config.server.keys.jwtSecret, { expiresIn: config.server.keys.jwtExpiration } as SignOptions);
    logger.info(`[JWT] Authenicated ${role} with key ending in ${apiKey.slice(-4)}`);
    res.json({ token });
}
