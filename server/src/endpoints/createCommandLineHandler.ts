import readline from "readline";
import { CommandTransmitter } from "../websocket/createCommandTransmitter";
import Endpoint from "./endpoint";

export function createCommandLineHandler(commandTransmitter: CommandTransmitter): Endpoint {
    const handleInput = (input: string) => {
        commandTransmitter.transmitFromString(input);
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    rl.on('line', handleInput);

    return { identifier: "CommandLineHandler" }
}