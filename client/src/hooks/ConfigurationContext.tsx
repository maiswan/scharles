import { createContext, ReactNode, useCallback, useContext, useMemo, useRef } from "react";
import { useLogger } from "./useLogger";

export interface ConfigurationContextProps {
    children: ReactNode;
}

export interface ConfigurationContextValues {
    getConfig: (key: ConfigKey) => string;
    setConfig: (key: ConfigKey, value: string) => void;
}

export const ConfigurationContext = createContext<ConfigurationContextValues | undefined>(undefined);

export function useConfigurationContext() {
    const context = useContext(ConfigurationContext);
    if (!context) { throw new Error("useConfigurationContext must be used within a ConfigurationProvider"); }
    return context;
}

type ConfigKey =
    | "maiswan/scharles-client.authKey"
    | "maiswan/scharles-client.authServer"
    | "maiswan/scharles-client.server"
    | "maiswan/scharles-client.modules";

const DEFAULT_CONFIG: Record<ConfigKey, string> = {
    "maiswan/scharles-client.authKey": "",
    "maiswan/scharles-client.authServer": "https://localhost:12024/api/v3/auth",
    "maiswan/scharles-client.server": "wss://localhost:12024",
    "maiswan/scharles-client.modules": JSON.stringify(['wallpaper', 'backdropFilter', 'noise', 'ripple', 'self']),
}

// remove "maiswan/scharles-client." for clearer debugging output
function trimKey(key: ConfigKey) {
    return key.substring(24);
}

export default function ConfigurationProvider({ children }: ConfigurationContextProps) {

    const config = useRef<Partial<Record<ConfigKey, string>>>({});
    const logger = useLogger();

    // Retrieve config in the following order: in-memory store > localStorage > defaults
    const getConfig = useCallback((key: ConfigKey) => {

        const sources = { 
            config: config.current[key],
            localStorage: localStorage.getItem(key),
            default: DEFAULT_CONFIG[key],
        }

        // { default: x } must always be non-null
        const entry = Object.entries(sources).find(([, value]) => value != null) as [string, string];

        const [source, value] = entry;
        logger.debug(`[ConfigProvider] Getting ${trimKey(key)} from ${source}`);
        return value;

    }, [logger]);

    // Writeback to in-memory store & localStorage
    const setConfig = useCallback((key: ConfigKey, value: string) => {

        logger.debug(`[ConfigProvider] Setting ${trimKey(key)}`);

        config.current = ({
            ...config.current,
            [key]: value
        });

        localStorage.setItem(key, value);
    }, [logger]);

    const value: ConfigurationContextValues = useMemo(() => ({
        getConfig, setConfig
    }), [getConfig, setConfig]);

    return (
        <ConfigurationContext.Provider value={value}>
            {children}
        </ConfigurationContext.Provider>
    );

}