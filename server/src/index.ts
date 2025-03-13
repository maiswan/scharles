import express from "express";
import { router } from "express-file-routing";
import cors from "cors";
import WebSocketHandler from "./WebSocketHandler";
import http from "http";
import { existsSync, readFileSync } from "fs";
import CommandLineHandler from "./CommandLineHandler";
import RandomPathFetcher from "./RandomPathFetcher";
import GetEndpointHandler from "./GetEndpointHandler";
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
const wsh = new WebSocketHandler(server, config, true);
const clh = new CommandLineHandler(wsh);
const geh = new GetEndpointHandler(app, wsh);

export const pathFetcher = new RandomPathFetcher(config.Private.wallpaper.data.Paths as string[]);

server.listen(config.Port, () => {
    console.log(`Secret config ${existsSync("env.secret.json") ? 'exists' : 'does not exist'}`)
    console.log(`Server             running at http://localhost:${config.Port}`);
    console.log(`WebSocketHandler   running at ws://localhost:${config.Port}`);
    console.log(`CommandLineHandler running`);
    console.log(`GetEndpointHandler running`);
});

app.get('/', (req, res) => { res.status(200).send("Running"); } );
