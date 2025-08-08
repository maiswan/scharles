import { readFileSync, existsSync, readFile } from "fs";
import { Config } from "../config";
import { logger } from "./app";

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

const paths = ["config.dev.json", "config.prod.json", "config.sample.json"];

export const readConfig = (path?: string) => {
    if (path) { return load(path); }

    for (const path of paths) {
        if (existsSync(path)) { return load(path); }
    }

    throw Error("No config file");
}

export const readCerts = (crt?: string, key?: string) => {
    crt ??= "./certs/server.crt";
    key ??= "./certs/server.key";

    return {
        cert: readFileSync("./certs/server.crt"),
        key: readFileSync("./certs/server.key")
    }
}