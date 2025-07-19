import { Request, Response, NextFunction } from "express";

const allowedIPs = ['::1', '127.0.0.1'];

// limit accessing command details to localhost
export default function localhostCheck(req: Request, res: Response, next: NextFunction) {
    if (req.ip && allowedIPs.includes(req.ip)) {
        next();
        return;
    }
    
    res.status(403).send();
}