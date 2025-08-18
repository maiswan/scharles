import { useCallback, useState } from "react"
import { logger } from "./useLogger";

type ConfigKey = 
    | "maiswan/scharles-client.server"
    | "maiswan/scharles-client.modules";


const DEFAULT_CONFIG: Record<ConfigKey, string> = {
    "maiswan/scharles-client.server": "wss://localhost:12024",
    "maiswan/scharles-client.modules": JSON.stringify(['wallpaper', 'backdropFilter', 'noise', 'ripple', 'self']),
}

export default function useConfiguration() {

    const [config, setConfig] = useState<Partial<Record<ConfigKey, string>>>({});

    // Retrieve config in the following order: in-memory store > localStorage > defaults
    const getConfig = useCallback((key: ConfigKey) => {
        const configValue = config[key];
        const localStorageValue = localStorage.getItem(key);
        const defaultValue = DEFAULT_CONFIG[key];

        logger.debug(`[useConfig] Getting ${key}; got [${configValue}, ${localStorageValue}, ${defaultValue}]`);

        return configValue ?? localStorageValue ?? defaultValue;
    }, [config]);

    const setConfigExternal = useCallback((key: ConfigKey, value: string) => {
        
        logger.debug(`[useConfig] Setting ${key}=${value}`);

        setConfig(prev => ({
            ...prev,
            [key]: value
        }));

        localStorage.setItem(key, value);
    }, []);

    return { getConfig, setConfig: setConfigExternal }
}