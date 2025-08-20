import "./App.css";
import Modules from "./modules/index"
import { useWebSocket } from "./hooks/useWebSocket";
import PackageJson from "../package.json"
import { useMemo } from "react";
import { useConfigurationContext } from "./hooks/ConfigurationContext";
import { useAuthenticationContext } from "./hooks/AuthenticationContext";

const App: React.FC = () => {
    const { getConfig } = useConfigurationContext();
    const { jwt } = useAuthenticationContext();

    const server = useMemo(() => getConfig("maiswan/scharles-client.server"), []);
    const modules: string[] = useMemo(() => JSON.parse(getConfig("maiswan/scharles-client.modules")), []);

    useWebSocket(server, jwt);

    return (
        <div className="relative w-screen h-screen">

            <div className="h-screen flex flex-col gap-4 justify-center items-center text-white">
                <h1>{PackageJson.name} {PackageJson.version}</h1>
                <p>Press <kbd className="buttonBase">CTRL</kbd><span className="mx-1">+</span><kbd className="buttonBase">,</kbd> to show the settings panel.</p>
            </div>
            {
                modules.map(x => {
                    const tsxName = x.charAt(0).toUpperCase() + x.substring(1);
                    if (!Object.keys(Modules).includes(tsxName)) { return null; }

                    const Module = Modules[tsxName as keyof typeof Modules];
                    return <Module key={x}/>;
                })
            }
        </div>
    );
};

export default App;
