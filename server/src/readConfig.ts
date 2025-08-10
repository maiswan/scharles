import { readFileSync, existsSync } from "fs";
import { Config } from "../config";
import { Logger, ILogObj } from "tslog";

const configPaths = ["config.dev.json", "config.prod.json", "config.sample.json", "config.json"];
const crtPaths = ["certs/server.dev.crt", "certs/server.prod.crt", "cert/server.crt"];
const keyPaths = ["certs/server.dev.key", "certs/server.prod.key", "cert/server.key"];

const readFirstExistingFile = (logger: Logger<ILogObj>, logDescription: string, paths: string[], overridePath: string | undefined) => {
    
    if (overridePath) { paths.unshift(overridePath); }

    for (const path of paths) {
        if (!existsSync(path)) { continue; }

        logger.info(`[App] Reading ${logDescription} at ${path}`);
        return readFileSync(path, 'utf-8');
    }

    logger.fatal(`[App] No ${logDescription} available`);
    process.exit(1);
}

export const readConfig = (logger: Logger<ILogObj>, path?: string) => {
    const data = readFirstExistingFile(logger, "config", configPaths, path);
    return JSON.parse(data) as Config;
}

export const readCerts = (logger: Logger<ILogObj>, crtPath?: string, keyPath?: string) => {
    const cert = readFirstExistingFile(logger, ".crt", crtPaths, crtPath);
    const key = readFirstExistingFile(logger, ".key", keyPaths, keyPath);

    return { cert, key };
}
