import express, { Request, Response, NextFunction } from "express";
import { router } from "express-file-routing";
import cors from "cors";
import rateLimit from "express-rate-limit";
import localhostCheck from "./localhostCheck";

export default function createApp(maxCommandLength: number, maxRequests: number, maxRequestsCooldownMs: number) {
    // Initialize server
    const app = express();
    app.use(express.json());
    app.use(cors());
    
    // File-based routing
    (async () => { app.use("/", await router()); })();
    
    // Limit path length
    app.use((req: Request, res: Response, next: NextFunction): void => {
        if (req.path.length > maxCommandLength) {
            res.status(414).send("Command too long.");
            return;
        }
        next();
    });

    // Limit access to /api/commands/* to localhost
    app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes("commands") && req.method !== "POST") { 
            localhostCheck(req, res, next);
        }
        next();
    })
    
    // Limit rate
    app.use(rateLimit({
        windowMs: maxRequestsCooldownMs,
        limit: maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: "Too many requests." }
    }));

    return app;
}
