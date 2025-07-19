import { useCallback, useState } from "react";
import { useRegisterModule } from "../../hooks/useRegisterModule";
import Debug from "../../components/Debug";


const Self: React.FC = () => {
    // Plugin
    const [clientId, setClientId] = useState("-1");

    const set = useCallback((key: string, value: string) => {
        if (key !== "clientId") { return `Unknown key ${key}`; }
        setClientId(value);
    }, []);

    // Module
    const identifier = "self";
    const state = useRegisterModule(identifier, { set });

    return (
        <>
            <title>{`scharles/client/${clientId}`}</title>
            {
                state.isEnabled() && state.isDebug() &&
                <Debug title={identifier} disableDebug={state.disableDebug}>
                    <div>clientId = {clientId}</div>
                </Debug>
            }
        </>
    );
}

export default Self;