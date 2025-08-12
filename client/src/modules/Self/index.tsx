import { useCallback, useEffect, useState } from "react";
import { useRegisterModule } from "../../hooks/useRegisterModule";
import PackageJson from "../../../package.json";
import { localStorageModulesIdentifier, localStorageServerIdentifier } from "../../App";

const Self: React.FC = () => {
    // Plugin
    const [clientId, setClientId] = useState("-1");
    const [server, setServer] = useState("");
    const [modules, setModules] = useState("");

    const set = useCallback((key: string, value: string) => {
        if (key !== "clientId") { return `Unknown key ${key}`; }
        setClientId(value);
    }, []);

    // Module
    const identifier = "self";
    const state = useRegisterModule(identifier, { set });

    // Initialize
    useEffect(() => {
        const server = localStorage.getItem(localStorageServerIdentifier) ?? "";
        const modules = localStorage.getItem(localStorageModulesIdentifier) ?? "";
        setServer(server);
        setModules(modules);

        // Show panel if no server has been specified
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
        localStorage.setItem(localStorageServerIdentifier, server);

        const modulesArray = modules.replace(/\W/g, " ").split(" ").filter(Boolean);
        localStorage.setItem(localStorageModulesIdentifier, JSON.stringify(modulesArray));

        location.reload();
    }, [modules, server]);

    return (
        <>
            <title>{`scharles-client/${clientId}`}</title>
            {
                state.isDebugging() &&
                <div className="fullscreen flex justify-center items-center">
                    <div className="w-full max-w-2xl m-4 z-100">
                        <header className="flex flex-row gap-4 justify-between font-semibold text-lg items-center bg-stone-300 px-4 py-2">
                            <h1>scharles-client {PackageJson.version}</h1>
                            <button className="max-w-16" onClick={close}>&#x2715;</button>
                        </header>
                        <div className="flex flex-col gap-4 bg-white p-4">

                            <div>Press <kbd className="buttonBase">CTRL</kbd><span className="mx-1">+</span><kbd className="buttonBase">,</kbd> to access this panel any time.</div>

                            <div className="mt-4">
                                <div>Server</div>
                                <input value={server} onChange={(e) => setServer(e.target.value)} className="my-1 px-2 py-1 border-1 border-stone-500 w-full font-mono" placeholder="wss://localhost:12024" />
                            </div>
                            <div className="mt-4 mb-8">
                                <div>Modules</div>
                                <input value={modules} onChange={(e) => setModules(e.target.value)} className="my-1 px-2 py-1 border-1 border-stone-500 w-full font-mono" placeholder="wallpaper,noise,self" />
                            </div>

                            <div className="flex flex-col md:flex-row gap-1">
                                <button onClick={reload}>Apply</button>
                                <button onClick={close}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}

export default Self;