import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export enum Role {
    Client = 1,
    Controller = 2,
    Admin = 3
}

export interface JwtRolePayload extends JwtPayload {
    role: Role;
    iss?: string | undefined;
    sub?: string | undefined;
    aud?: string | string[] | undefined;
    exp?: number | undefined;
    nbf?: number | undefined;
    iat?: number | undefined;
    jti?: string | undefined;
}

const authenticateJwt = (requiredMinimumRole: Role) => async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Invalid Authorization header" });
    }

    const jwtSecret = req.app.locals.config.server.authentication.jwtSecret;
    const token = authHeader.split(" ")[1];

    try {

        req.user = jwt.verify(token, jwtSecret) as JwtRolePayload;
        if (req.user.role >= requiredMinimumRole) {
            next();
            return;
        }

    } catch { }

    return res.status(403).json({ error: "Forbidden" });
}

export default authenticateJwt;
