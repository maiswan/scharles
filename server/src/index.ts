import express from "express";
import { router } from "express-file-routing";
import cors from "cors";
import WebSocketHandler from "./WebSocketHandler";
import http from "http";
import { existsSync, readFileSync } from "fs";
import CommandLineHandler from "./input/CommandLineHandler";
import RandomPathFetcher from "./RandomPathFetcher";
import GetEndpointHandler from "./input/GetEndpointHandler";
import InputProcessor from "./input/InputProcessor";
import { Environment } from "../env";

// Initialize server
const app = express();
app.use(cors());
router().then(x => app.use(x));
const server = http.createServer(app);

// Read config
const load = (path: string): Environment => {
    const data = readFileSync(path, 'utf-8');
    const config = JSON.parse(data) as Environment;
    return config;
}

const config = existsSync("env.secret.json")
    ? load("env.secret.json")
    : load("env.json")

// Initialize modules
const wsh = new WebSocketHandler(server, config);
const inp = new InputProcessor(wsh);
const clh = new CommandLineHandler(inp);
const geh = new GetEndpointHandler(inp, app);

export const pathFetcher = new RandomPathFetcher(config.Private.wallpaper.data.Paths as string[]);

server.listen(config.Port, () => {
    console.log(`Secret config ${existsSync("env.secret.json") ? 'exists' : 'does not exist'}`)
    console.log(`Server             running at http://localhost:${config.Port}`);
    console.log(`WebSocketHandler   running at ws://localhost:${config.Port}`);
    console.log(`CommandLineHandler running`);
    console.log(`GetEndpointHandler running`);
});

app.get('/', (req, res) => { res.status(200).send("Running"); } );

process.on("SIGINT", () => {
    console.log("Server shutting down... not that it ever truly lived.");
    
    server.close(() => {
        console.log(`Port ${config.Port} is free. Unless Node.js refuses to die.`);
        process.exitCode = 0;
    });
})