import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { config } from "../../app";

export type Role = /* "client" | */ "controller" | "admin";

export interface JwtRolePaylaod extends JwtPayload {
    role: Role;
    issuedAt: number;
}

const hasPermission = (role: Role, requiredMinimumRole: Role) => {
    // if (role === "client" && requiredMinimumRole !== "client") { return false; }
    if (role === "controller" && requiredMinimumRole === "admin") { return false; }
    return true;
}
const authenticateJwt = (requiredMinimumRole: Role) => async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader?.split(" ")[1];

    try {
        const decoded = jwt.verify(token, config.server.keys.jwtSecret) as JwtRolePaylaod;
        (req as any).user = decoded;

        const role = decoded.role;
        if (hasPermission(role, requiredMinimumRole)) {
            next();
            return;
        }

        return res.status(403).json({ error: "Invalid token" });

    } catch {
        return res.status(403).json({ error: "Invalid token" });
    }
}

export default authenticateJwt;