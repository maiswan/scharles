import React, { useEffect, useState } from 'react';
import withModularMethods from '../withModularMethods';
import { ModularProps } from '../types';

const SelfComponent: React.FC<ModularProps> = ({ data, isDebug }) => {
    const [clientId, setClientId] = useState(-2);

    useEffect(() => {
        if (data.clientId !== undefined) { 
            const id = data.clientId as number;
            setClientId(id);
            document.title = `charles/client/${id}`;
        }
    }, [data]);

    return (
        isDebug &&
        <div className="absolute top-0 left-0 m-2 bg-white p-2 px-4 z-100">
            <div className="font-bold">App</div>
            <div>clientId = {clientId}</div>
        </div>
    );
};

const Self = withModularMethods(SelfComponent);
export default Self;