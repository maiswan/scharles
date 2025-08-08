import readline from "readline";
import { CommandTransmitter } from "../websocket/createCommandTransmitter";

export function createCommandLineHandler(commandTransmitter: CommandTransmitter) {
    const handleInput = (input: string) => {
        commandTransmitter.transmitFromString(input);
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    rl.on('line', handleInput);
}