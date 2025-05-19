import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Module } from '../types';
import image from "./noise.png";
import { useModule } from '../../hooks/useModule';

const Noise = forwardRef<Module, unknown>((_, ref) => {
    // Module
    const identifier = "noise";
    const acceptedDataKeys = ["opacity"];
    const state = useModule(identifier, acceptedDataKeys);
    useImperativeHandle(ref, () => state);

    // Plugin
    const [opacity, setOpacity] = useState(1.0);

    useEffect(() => {
        if (state.data.opacity) { setOpacity(state.data.opacity as number); }
    }, [state.data]);

    if (!state.isEnabled) { return; }
    return (
        <div>
            <div className="w-screen h-screen bg-repeat transition-opacity duration-500" style={{ backgroundImage: `url(${image}`, opacity: `${opacity}` }} />
            {
                state.isDebug && <div className="absolute top-0 left-0 m-2 bg-white p-2 px-4 z-100">
                    <div>{image}</div>
                    <div>{opacity}</div>
                </div>
            }
        </div>
    );
});

export default Noise;