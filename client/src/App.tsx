import "./App.css";

import { FC, RefObject, useRef, useState, useEffect, createRef } from 'react';
import Modules from "./modules/index"
import { useWebSocket } from "./hooks/useWebSocket";
import { Module } from "./modules/types";

// Edit here
export const server = "ws://localhost:12024"
const moduleNames = ['wallpaper', 'backdropFilter', 'noise', 'ripple', 'self'];

const App: FC = () => {
    const [isInitialized, setIsInitialized] = useState(false);

    const refs = useRef<Record<string, RefObject<Module | null>>>(
        Object.fromEntries(
            moduleNames.map(name => [name, createRef<Module>()])
        )
    );

    useWebSocket(refs, isInitialized);

    useEffect(() => {
        setIsInitialized(true);
    }, []);

    return (
        <div className="[&>*]:absolute">
            {moduleNames.map(name => {
                const tsxName = name.charAt(0).toUpperCase() + name.substring(1);
                const Module = Modules[tsxName as keyof typeof Modules];
                const ref = refs.current[name];
                return <Module key={name} ref={ref}/>;
            })}
        </div>
    );
};

export default App;
