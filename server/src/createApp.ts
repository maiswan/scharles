import express from "express";
import { router } from "express-file-routing";
import cors from "cors";
import rateLimit from "express-rate-limit";
import Config from "../config";

export default function createApp(config: Config) {
    // Initialize server
    const app = express();
    app.use(cors());
    
    // File-based routing
    (async () => { app.use("/", await router()); })();
    
    // Limit body length
    const limits = config.server.rateLimit;

    app.use(express.json({ limit: limits.maxRequestLength }));
    app.use(express.urlencoded({ extended: true }));
    
    // Limit rate
    app.use(rateLimit({
        windowMs: limits.cooldownMs,
        limit: limits.maxRequests,
    }));

    return app;
}
