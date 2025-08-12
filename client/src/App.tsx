import "./App.css";
import Modules from "./modules/index"
import { useWebSocket } from "./hooks/useWebSocket";

export const localStorageServerIdentifier = "maiswan/scharles-client.server";
export const localStorageModulesIdentifier = "maiswan/scharles-client.modules";

const server = localStorage.getItem(localStorageServerIdentifier) ?? "";

const builtInModules = ['wallpaper', 'backdropFilter', 'noise', 'ripple', 'self'];
const localStorageModules = localStorage.getItem(localStorageModulesIdentifier);
if (!localStorageModules) {
    localStorage.setItem(localStorageModulesIdentifier, JSON.stringify(builtInModules));
}
const modules: string[] = localStorageModules ? JSON.parse(localStorageModules) : builtInModules;

const importedModuleIdentifiers = Object.keys(Modules); 

const App: React.FC = () => {
    useWebSocket(server);

    return (
        <div className="relative w-screen h-screen">
            {
                modules.map(x => {
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
