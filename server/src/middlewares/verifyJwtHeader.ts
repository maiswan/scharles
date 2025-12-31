import { NextFunction, Request, Response } from "express";
import { Role } from "../Roles";
import verifyJwt from "../verifyJwt";

const verifyJwtHeader = (minimumRequiredRole: Role) => async (req: Request, res: Response, next: NextFunction) => {
    // Extra check for HTTP headers
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Invalid Authorization header" });
    }

    const jwtSecret = req.app.locals.config.server.authentication.jwtSecret;
    const token = authHeader.split(" ")[1];

    const result = verifyJwt(token, jwtSecret, minimumRequiredRole);
    if (!result.isValid) {
        return res.status(403).json({ error: "Forbidden" });
    }

    // Store authentication result, so users can GET /api/vX/auth to check authentication status
    req.user = result;
    next();
}

export default verifyJwtHeader;
