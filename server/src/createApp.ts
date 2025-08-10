import express, { Request, Response, NextFunction } from "express";
import { router } from "express-file-routing";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { ServerConfig } from "../config";

export default function createApp(config: ServerConfig) {
    // Initialize server
    const app = express();
    app.use(cors());
    
    // File-based routing
    (async () => { app.use("/", await router()); })();
    
    // Limit body length
    app.use(express.json({ limit: config.maxCommandLength }));
    app.use(express.urlencoded({ extended: true }));
    
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
