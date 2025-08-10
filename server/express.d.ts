import { Logger, ILogObj } from "tslog";
import { Config } from "./config";
import { CommandStore } from "./src/createCommandStore";
import { CommandTransmitter } from "./src/websocket/createCommandTransmitter";

declare global {
    namespace Express {
        interface Locals {
            logger: Logger<ILogObj>,
            config: Config,
            commandStore: CommandStore,
            commandTx: CommandTransmitter,
        }
    }
}