import "./App.css";
import Modules from "./modules/index"
import { useWebSocket } from "./hooks/useWebSocket";

// Edit here
const server = "wss://localhost:12024";
const modules = ['wallpaper', 'backdropFilter', 'noise', 'ripple', 'self'];

const App: React.FC = () => {
    useWebSocket(server);

    return (
        <div className="relative w-screen h-screen">
            {
                modules.map(x => {
                    const tsxName = x.charAt(0).toUpperCase() + x.substring(1);
                    const Module = Modules[tsxName as keyof typeof Modules];
                    return <Module key={x}/>;
                })
            }
        </div>
    );
};

export default App;
