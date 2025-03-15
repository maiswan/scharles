import readline from "readline";
import InputProcessor from "./InputProcessor";

export default class CommandLineHandler {
    private inputProcessor: InputProcessor;

    constructor(inputProcessor: InputProcessor) {
        this.inputProcessor = inputProcessor;
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        }); 
        rl.on('line', this.handleInput);
    }

    private handleInput = async (input: string) => {
        const response = await this.inputProcessor.processFromSingleValue(input);
        console.log(response);
    }
}
