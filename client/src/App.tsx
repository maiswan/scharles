import "./App.css";

import React, { useRef, useEffect } from 'react';
import { ModularMethods } from './components/types';
import Wallpaper from "./components/Wallpaper/Wallpaper";
import Noise from "./components/Noise/Noise";
import BackdropFilter from "./components/BackdropFilter/BackdropFilter";
import Ripple from "./components/Ripple/ripple";
import WebSocketReceiver from "./WebSocketReceiver";
import Self from "./components/Self/Self";

const App: React.FC = () => {
    // Define the hashtable type as a Record mapping strings to ModularMethods refs
    const components = useRef<Record<string, React.RefObject<ModularMethods | null>>>({});

    // Initialize refs for each component
    const wallpaperRef = useRef<ModularMethods | null>(null);
    const noiseRef = useRef<ModularMethods | null>(null);
    const backdropFilterRef = useRef<ModularMethods | null>(null);
    const rippleRef = useRef<ModularMethods | null>(null);
    const selfRef = useRef<ModularMethods | null>(null);

    // Populate the hashtable with refs after component mount
    useEffect(() => {
        components.current = {
            'wallpaper': wallpaperRef,
            'noise': noiseRef,
            'backdropFilter': backdropFilterRef,
            'ripple': rippleRef,
            'self': selfRef,
        };
    }, []);

    // Listen for commands
    useEffect(() => {
        const wsr = new WebSocketReceiver("ws://localhost:12024", components);
        return () => wsr.close();
    }, []);

    return (
        <div className="[&>*]:absolute">
            <Wallpaper ref={wallpaperRef}/>
            <BackdropFilter ref={backdropFilterRef}/>
            <Noise ref={noiseRef}/>
            <Ripple ref={rippleRef}/>
            <Self ref={selfRef}/>
        </div>
    );
};

export default App;
