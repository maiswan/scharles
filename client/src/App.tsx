import "./App.css";

import React, { useRef, useEffect } from 'react';
import { ModularMethods } from './components/types';
import WebSocketReceiver from "./WebSocketReceiver";
import * as Components from "./components/index"

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
        new WebSocketReceiver("ws://localhost:12024", components);
    }, []);

    return (
        <div className="[&>*]:absolute">
            <Components.Wallpaper ref={wallpaperRef}/>
            <Components.BackdropFilter ref={backdropFilterRef}/>
            <Components.Noise ref={noiseRef}/>
            <Components.Ripple ref={rippleRef}/>
            <Components.Self ref={selfRef}/>
        </div>
    );
};

export default App;
