import { createWebSocketHandler } from "./websocket/createWebSocketHandler";
import https from "https";
import { readFileSync } from "fs";
import { createCommandLineHandler } from "./commandLineHandler";
import { createCommandTransmitter } from "./websocket/createCommandTransmitter";
import { createCommandStore } from "./createCommandStore";
import createApp from "./createApp";
import { Logger, ILogObj } from "tslog";
import { readConfig, readCerts } from "./readConfig";

// Singleton logger instance
export const logger = new Logger<ILogObj>({
    prettyLogTemplate: "{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t",
});


// Initialize server
export const config = readConfig();
const certs = readCerts();

const app = createApp(config.server)
const httpsServer = https.createServer(certs, app);

// Initialize modules
export const commandStore = createCommandStore(config.server.maxCommandHistorySaved);
const wssHandler = createWebSocketHandler(httpsServer, config, commandStore);
export const commandTx = createCommandTransmitter(wssHandler);

createCommandLineHandler(commandTx);

// Go live
logger.info("[App] Starting in", __dirname);
httpsServer.listen(config.server.port, () => {
    logger.info('[App] HTTPS server running at port', config.server.port);
});

// Die
process.on("SIGINT", () => {
    logger.info("[App] Server shutting down");

    httpsServer.close(() => {
        logger.info(`[App] Port ${config.server.port} is free. Unless Node refuses to die (this has happened before).`);
        process.exitCode = 0;
    });
})
