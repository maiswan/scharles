import { Request, Response, NextFunction } from "express";
import { matches } from "ip-matching";

export default function checkApiAccess(req: Request, res: Response, next: NextFunction, apiFullAllowedHosts: string[], apiBaseAllowedHosts: string[]) {
    const ip = req.ip ?? "";
    const canAccessFullApi = apiFullAllowedHosts.find(x => matches(ip, x));
    const canAccessBaseApi = apiBaseAllowedHosts.find(x => matches(ip, x));
    const isAccessingFullApi = req.path.includes("commands") && req.method !== "POST";

    const canAccess = !canAccessBaseApi || !canAccessFullApi && isAccessingFullApi;

    if (!canAccess) {
        res.status(403).send();
        return;
    }
    
    next();
}