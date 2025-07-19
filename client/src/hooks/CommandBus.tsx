import { createContext, PropsWithChildren, useContext, useReducer } from "react";
import { Command } from "../../../shared/command";
import { useLogger } from "./useLogger";

type ModuleDefinition = {
    identifier: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    methods: Record<string, (...args: any[]) => any>;
};

export type CommandAPI = {
    command: Command;
    respond: (command: Command, success: boolean, data: unknown | null) => void;
}

type State = {
    modules: Record<string, ModuleDefinition>;
};

const CommandContext = createContext<{
    state: State;
    dispatchCommand: (commandAPI: CommandAPI) => void;
    register: (module: ModuleDefinition) => void;
    unregister: (identifier: string) => void;
}>(null!);

type Action =
    | { type: "register"; module: ModuleDefinition }
    | { type: "unregister"; identifier: string }
    | { type: "dispatch"; commandAPI: CommandAPI };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "register":
            return { modules: { ...state.modules, [action.module.identifier]: action.module } };

        case "unregister": {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [action.identifier]: _, ...rest } = state.modules;
            return { modules: rest };
        }
            
        case "dispatch": {
            const command = action.commandAPI.command;
            const respond = action.commandAPI.respond;
            const module = state.modules[command.module];

            if (!module) { 
                respond(command, false, "Module not found");
                return state;
            }

            if (typeof module.methods[command.action] !== "function") {
                respond(command, false, "Method not implemented");
                return state;
            }

            // Render CommandProvider first before executing anything
            setTimeout(() => {
                const output = module.methods[command.action](...command.parameters);
                respond(command, true, output);
            }, 0);
            
            return state;
        }
        default:
            return state;
    }
}

export const CommandProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, { modules: {} });
    const logger = useLogger();

    const dispatchCommand = (commandAPI: CommandAPI) => {
        const command = commandAPI.command;
        logger.debug(`[CommandBus] Dispatching command #${command.commandId.substring(0, 8)} (${command.module}.${command.action})`);
        dispatch({ type: "dispatch", commandAPI });
    }

    const register = (module: ModuleDefinition) => {
        logger.debug("[CommandBus] Registering module", module.identifier);
        dispatch({ type: "register", module });
    }

    const unregister = (name: string) => {
        logger.debug("[CommandBus] Unregistering module", name);
        dispatch({ type: "unregister", identifier: name });
    }
    
    return (
        <CommandContext.Provider value={{ state, dispatchCommand, register, unregister }}>
            {children}
        </CommandContext.Provider>
    );
};

export const useCommandBus = () => useContext(CommandContext);