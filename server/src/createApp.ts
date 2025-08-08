import express, { Request, Response, NextFunction } from "express";
import { router } from "express-file-routing";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { ServerConfig } from "../config";

export default function createApp(config: ServerConfig) {
    // Initialize server
    const app = express();
    app.use(express.json());
    app.use(cors());
    
    // File-based routing
    (async () => { app.use("/", await router()); })();
    
    // Limit path length
    app.use((req: Request, res: Response, next: NextFunction): void => {
        if (req.path.length > config.maxCommandLength) {
            res.status(414).send("Command too long.");
            return;
        }
        next();
    });
    
    // Limit rate
    app.use(rateLimit({
        windowMs: config.rateLimit.cooldownMs,
        limit: config.rateLimit.maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: "Too many requests." }
    }));

    return app;
}
