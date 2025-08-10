import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import authenticateJwt, { JwtRolePayload, Role } from "../../../../middlewares/jwt";

const roleToConfigKey = (role: Role) => {
    switch (role) {
        case "controller":
            return "controllers";
        case "admin":
            return "admins";
    }
}

// Allow users to authenticate themselves with an API key
// Return them a JWT on success
export const post = (req: Request, res: Response) => {
    const { apiKey } = req.body;
    const logger = req.app.locals.logger;
    const auth = req.app.locals.config.server.authentication;

    if (!apiKey) {
        logger.debug("[JWT] No API key to authenticate");
        return res.status(400).json({ error: "API key required" });
    }

    let role: Role | null = null;

    if (auth.controllers.keys.includes(apiKey)) { role = "controller"; }
    if (role == null && auth.admins.keys.includes(apiKey)) { role = "admin"; }

    if (!role) {
        logger.debug(`[JWT] Invalid API key ending in ${apiKey.slice(-4)}`);
        return res.status(401).json({ error: "Invalid API key" });
    }

    const payload: JwtRolePayload = {
        role,
        issuedAt: Date.now()
    };

    const expiresIn = auth[roleToConfigKey(role)].jwtExpiration;
    const token = jwt.sign(payload, auth.jwtSecret, { expiresIn } as SignOptions);

    logger.info(`[JWT] Authenicated ${role} with key ending in ${apiKey.slice(-4)} for ${expiresIn}`);
    res.status(200).json({ token });
}

// Debugging endpoint for users to test if they're authenticated
// If so, return what we know about them
export const get = [
    authenticateJwt("controller"),
    (req: Request, res: Response) => {
        res.status(200).json(req.user);
    }
];
