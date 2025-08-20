import { useCallback, useEffect, useState } from "react";
import { useRegisterModule } from "../../hooks/useRegisterModule";
import PackageJson from "../../../package.json";
import { useConfigurationContext } from "../../hooks/ConfigurationContext";
import { useCommandBus } from "../../hooks/CommandBus";
import { Command } from "../../../../shared/command";

const Self: React.FC = () => {
    // Plugin
    const [clientId, setClientId] = useState("-1");
    const { dispatchCommand } = useCommandBus();

    const set = useCallback((key: string, value: string) => {
        if (key !== "clientId") { return `Unknown key ${key}`; }
        setClientId(value);
    }, []);

    // Module
    const identifier = "self";
    const state = useRegisterModule(identifier, { set });

    // Config
    const { getConfig, setConfig } = useConfigurationContext();
    const [server, setServer] = useState(() => getConfig("maiswan/scharles-client.server"));
    const [modules, setModules] = useState(() => getConfig("maiswan/scharles-client.modules"));
    const [authKey, setAuthKey] = useState(() => getConfig("maiswan/scharles-client.authKey"));
    const [authServer, setAuthServer] = useState(() => getConfig("maiswan/scharles-client.authServer"));

    // Debug
    const [debug, setDebug] = useState("");
    const [debugOutput, setDebugOutput] = useState("");

    const sendDebug = useCallback(() => {

        const components = debug.split(" ");

        dispatchCommand({
            command: {
                commandId: "",
                module: components[0],
                action: components[1],
                parameters: components.slice(2),
            },
            respond: (command: Command, success: boolean, data: unknown | null) => { setDebugOutput(JSON.stringify({ command, success, data })); }
        })
    }, [debug, dispatchCommand]);


    // Initialize: show panel if no server has been specified
    useEffect(() => {
        if (!server) { state.enableDebug(); }
    }, []);

    // Ctrl+, to toggle
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!e.getModifierState("Control")) { return; }
            if (e.key !== ",") { return; }

            state.toggleDebug();
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    // Actions
    const close = useCallback(() => {
        state.disableDebug();
    }, [state]);

    const reload = useCallback(() => {
        setConfig("maiswan/scharles-client.server", server);

        const modulesArray = modules.replace(/\W/g, " ").split(" ").filter(Boolean);
        setConfig("maiswan/scharles-client.modules", JSON.stringify(modulesArray));

        setConfig("maiswan/scharles-client.authKey", authKey);
        setConfig("maiswan/scharles-client.authServer", authServer);

        location.reload();
    }, [authKey, authServer, modules, server, setConfig]);

    return (
        <>
            <title>{`${PackageJson.name}/${clientId}`}</title>
            {
                state.isDebugging() &&
                <div className="fullscreen flex justify-center items-center shadow-lg">
                    <div className="w-full max-w-2xl m-4 z-100 bg-white">
                        <header className="bg-stone-200 p-4 border-b-1 border-stone-400/50">
                            <div className="flex flex-row gap-4 justify-between mb-1">
                                <h1>{PackageJson.name} {PackageJson.version}</h1>
                                <button className="max-w-16" onClick={close}>&#x2715;</button>
                            </div>

                            <p>Press <kbd className="buttonBase">CTRL</kbd><span className="mx-1">+</span><kbd className="buttonBase">,</kbd> to access this panel any time.</p>
                        </header>

                        <div className="flex flex-col gap-1 p-4 max-h-[60vh] overflow-y-auto">
                            <h2>Settings</h2>
                            <div className="secondary">Server</div>
                            <input value={server} onChange={(e) => setServer(e.target.value)} placeholder="wss://localhost:12024" />

                            <div className="mt-4 secondary">Modules</div>
                            <input value={modules} onChange={(e) => setModules(e.target.value)} placeholder="wallpaper,noise,self" />

                            <div className="mt-4 secondary">Authentication Key</div>
                            <input value={authKey} onChange={(e) => setAuthKey(e.target.value)} placeholder="" />

                            <div className="mt-4 secondary">Authentication Server</div>
                            <input value={authServer} onChange={(e) => setAuthServer(e.target.value)} placeholder="https://localhost:12024/api/v3/auth" />

                            <h2 className="mt-8">Debug</h2>
                            <div className="secondary">Send to CommandBus</div>
                            <div className="flex flex-col md:flex-row gap-1">
                                <input value={debug} onChange={(e) => setDebug(e.target.value)} placeholder="wallpaper enable" />
                                <button onClick={sendDebug} className="md:max-w-32">Send</button>
                            </div>
                            <div className="secondary font-mono select-text">{debugOutput}</div>
                        </div>

                        <footer className="flex flex-col md:flex-row gap-1 bg-stone-200 border-t-1 border-stone-400/50 p-4">
                            <button onClick={reload}>Apply</button>
                            <button onClick={close}>Close</button>
                        </footer>
                    </div>
                </div>
            }
        </>
    );
}

export default Self;