import { createWebSocketHandler } from "./websocket/createWebSocketHandler";
import http from "http";
import { existsSync, readFileSync } from "fs";
import { createCommandLineHandler } from "./endpoints/createCommandLineHandler";
import { createHttpGetHandler } from "./endpoints/createHttpGetHandler";
import { Config } from "../config";
import { createCommandTransmitter } from "./websocket/createCommandTransmitter";
import Endpoint from "./endpoints/endpoint";
import { createCommandStore } from "./createCommandStore";
import createApp from "./createApp";
import { Logger, ILogObj } from "tslog";

// Singleton logger instance
export const logger = new Logger<ILogObj>({
    prettyLogTemplate: "{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t",
});

// Read config
const load = (path: string): Config => {
    logger.info('[App] Reading config at', path);

    try {
        const data = readFileSync(path, 'utf-8');
        const json = JSON.parse(data);
        logger.debug('[App] Read config', json);
        return json as Config;
    }
    catch (error) {
        logger.fatal(error);
        process.exit(1);
    }
}

export const config = existsSync("config.prod.json")
    ? load("config.prod.json")
    : load("config.sample.json");

// Initialize server
const app = createApp(config.server.maxCommandLength, config.server.rateLimit.maxRequests, config.server.rateLimit.cooldownMs);
const httpServer = http.createServer(app);

// Initialize modules
const commandStore = createCommandStore();
const wsHandler = createWebSocketHandler(httpServer, config, commandStore);
const commandTx = createCommandTransmitter(wsHandler);

const endpoints: Endpoint[] = []
endpoints.push(createCommandLineHandler(commandTx));
endpoints.push(createHttpGetHandler(commandTx, app, commandStore));

// Go live
httpServer.listen(config.server.port, () => {
    logger.info('[App] Server running at port', config.server.port);
    logger.info('[App] Active RC endpoints:', endpoints.map(x => x.identifier));
});

// Die
process.on("SIGINT", () => {
    logger.info("[App] Server shutting down");

    httpServer.close(() => {
        logger.info(`[App] Port ${config.server.port} is free. Unless Node refuses to die (this has happened before).`);
        process.exitCode = 0;
    });
})
