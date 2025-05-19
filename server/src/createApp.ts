import express, { Request, Response, NextFunction } from "express";
import { router } from "express-file-routing";
import cors from "cors";
import rateLimit from "express-rate-limit";

export default function createApp(maxCommandLength: number, maxRequests: number, maxRequestsCooldownMs: number) {
    // Initialize server
    const app = express();
    
    // Bypass CORS
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

    // Allow only GET
    app.use((req: Request, res: Response, next: NextFunction): void => {
        if (req.method !== 'GET') {
            res.status(401).send("HTTP method not allowed");
            return;
        }
        next();
    });
    
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
