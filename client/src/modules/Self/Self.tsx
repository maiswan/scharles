import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Module } from '../types';
import { useModule } from '../../hooks/useModule';

const Self = forwardRef<Module, unknown>((_, ref) => {
    // Module
    const identifier = "self";
    const state = useModule(identifier, ["clientId"]);
    useImperativeHandle(ref, () => state);

    // Plugin
    const [clientId, setClientId] = useState(-1);

    useEffect(() => {
        if (state.data.clientId != null) { setClientId(Number(state.data.clientId)); }
    }, [state.data, state.data.clientId])

    return (
        <>
            <title>{`scharles/client/${clientId}`}</title>
            {
                state.isEnabled && state.isDebug &&
                <div className="absolute top-0 left-0 m-2 bg-white p-2 px-4 z-100">
                    <div className="font-bold">{state.identifier}</div>
                    <div>clientId = {clientId}</div>
                </div>
            }
        </>
    );
});

export default Self;