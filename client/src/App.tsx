import "./App.css";
import Modules from "./modules/index"
import { useWebSocket } from "./hooks/useWebSocket";
import PackageJson from "../package.json"

export const localStorageServerIdentifier = "maiswan/scharles-client.server";
export const localStorageModulesIdentifier = "maiswan/scharles-client.modules";

const server = localStorage.getItem(localStorageServerIdentifier) ?? "";

const builtInModules = ['wallpaper', 'backdropFilter', 'noise', 'ripple', 'self'];
const localStorageModules = localStorage.getItem(localStorageModulesIdentifier);
if (!localStorageModules) {
    localStorage.setItem(localStorageModulesIdentifier, JSON.stringify(builtInModules));
}
const moduleNames: string[] = localStorageModules ? JSON.parse(localStorageModules) : builtInModules;

const importedModuleIdentifiers = Object.keys(Modules); 

const App: React.FC = () => {
    useWebSocket(server);

    return (
        <div className="relative w-screen h-screen">

            <div className="h-screen flex flex-col gap-4 justify-center items-center text-white">
                <h1>{PackageJson.name} {PackageJson.version}</h1>
                <p>Press <kbd className="buttonBase">CTRL</kbd><span className="mx-1">+</span><kbd className="buttonBase">,</kbd> to show the settings panel.</p>
            </div>
            {
                moduleNames.map(x => {
                    const tsxName = x.charAt(0).toUpperCase() + x.substring(1);
                    if (!importedModuleIdentifiers.includes(tsxName)) { return null; }

                    const Module = Modules[tsxName as keyof typeof Modules];
                    return <Module key={x}/>;
                })
            }
        </div>
    );
};

export default App;
