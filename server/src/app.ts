import { createWebSocketHandler } from "./websocket/createWebSocketHandler";
import https from "https";
import { createCommandLineHandler } from "./commandLineHandler";
import createCommandStore from "./createCommandStore";
import createApp from "./createApp";
import { Logger, ILogObj } from "tslog";
import { readConfig, readCerts } from "./readConfig";
import Package from "../package.json"
import handleAuthRequest from "./websocket/handlers/handleAuthRequest";
import handleConfigRequest from "./websocket/handlers/handleConfigRequest";
import handleCommandResult from "./websocket/handlers/handleCommandResult";
// Singleton logger instance
const logger = new Logger<ILogObj>({
    prettyLogTemplate: "{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t",
});

logger.info("[App]", Package.name, Package.version);
logger.info("[App] Starting in", __dirname);

// Initialize server
const config = readConfig(logger);
const certs = readCerts(logger, config.server.authentication.crtPath, config.server.authentication.keyPath);

const app = createApp(config);
const httpsServer = https.createServer(certs, app);

// Initialize modules
const commandStore = createCommandStore(logger, config.server.maxCommandHistorySaved);
const wsHandler = createWebSocketHandler(logger, httpsServer, config, commandStore);
wsHandler.registerMessageHandler("authRequest", handleAuthRequest);
wsHandler.registerMessageHandler("configRequest", handleConfigRequest);
wsHandler.registerMessageHandler("commandResult", handleCommandResult);
createCommandLineHandler(wsHandler);

app.locals.logger = logger;
app.locals.config = config;
app.locals.commandStore = commandStore;
app.locals.wsHandler = wsHandler;

// Go live
httpsServer.listen(config.server.port, () => {
    logger.info('[App] HTTPS server running at port', config.server.port);
});

// Die
process.on("SIGINT", () => {
    logger.info("[App] Shutting down");

    httpsServer.close(() => {
        logger.info(`[App] Port ${config.server.port} is free, unless Node refuses to die (this has happened before).`);
        process.exitCode = 0;
    });
})
