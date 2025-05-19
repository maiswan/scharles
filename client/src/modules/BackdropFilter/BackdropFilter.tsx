import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Module } from '../types';
import { useModule } from '../../hooks/useModule';

const acceptedFilters = ["blur", "brightness", "contrast", "grayscale", "invert", "opacity", "sepia", "saturate", "hue-rotate", "url"];

const toCssFilters = (filters: Record<string, unknown>): string => {
    return Object.entries(filters)
        .filter(([, value]) => value != null)
        .map(([key, value]) => `${key}(${value})`)
        .join(' ');
};

const BackdropFilter = forwardRef<Module, unknown>((_, ref) => {
    // Module
    const identifier = "backdropFilter";
    const state = useModule(identifier, acceptedFilters);
    useImperativeHandle(ref, () => state);

    // Plugin
    const [filters, setFilters] = useState("");

    useEffect(() => {
        if (state.data) { setFilters(toCssFilters(state.data)); }
    }, [state.data]);

    if (!state.isEnabled) { return; }
    return (
        <div>
            <div className="w-screen h-screen transition-all duration-500" style={{ backdropFilter: filters }} />
            {
                state.isDebug && <div className="absolute top-0 left-0 m-2 bg-white p-2 px-4 z-100">
                    <div>{Object.keys(state.data).map(x => <span key={x}>{x}</span>)}</div>
                    <div>^{filters}$</div>
                </div>
            }
        </div>
    );
});

export default BackdropFilter;