import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export type Role = "controller" | "admin";

export interface JwtRolePayload extends JwtPayload {
    role: Role;
    issuedAt: number;
}

const hasPermission = (role: Role, requiredMinimumRole: Role) => {
    if (role === "admin") { return true; }
    if (role === "controller" && requiredMinimumRole === "controller") { return true; }
    return false;
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
        if (hasPermission(req.user.role, requiredMinimumRole)) {
            next();
            return;
        }

    } catch { }

    return res.status(403).json({ error: "Forbidden" });
}

export default authenticateJwt;
