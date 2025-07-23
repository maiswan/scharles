import { Request, Response, NextFunction } from "express";

export default function checkApiAccess(req: Request, res: Response, next: NextFunction, apiFullAllowedHosts: string[], apiBaseAllowedHosts: string[]) {
    const ip = req.ip ?? "";
    const canAccessFullApi = apiFullAllowedHosts.includes("*") || apiFullAllowedHosts.includes(ip);
    const canAccessBaseApi = apiBaseAllowedHosts.includes("*") || apiBaseAllowedHosts.includes(ip);
    const isAccessingFullApi = req.path.includes("commands") && req.method !== "POST";

    if (!canAccessFullApi && isAccessingFullApi) {
        res.status(403).send();
        return;
    }

    if (!canAccessBaseApi) {
        res.status(403).send();
        return;
    }

    next();
}