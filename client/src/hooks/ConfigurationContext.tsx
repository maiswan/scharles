import React, { ReactNode, createContext, useState, useEffect } from 'react';

export interface Config {
    "maiswan/scharles-client.authKey": string,
    "maiswan/scharles-client.authServer": string,
    "maiswan/scharles-client.server": string,
    "maiswan/scharles-client.modules": string,
}

type ConfigKey = keyof Config;

interface ConfigContextValue {
    config: Config;
    setConfig: (key: ConfigKey, value: Config[ConfigKey]) => void;
}

const defaultConfig: Config = {
    "maiswan/scharles-client.authKey": "",
    "maiswan/scharles-client.authServer": "https://localhost:12024/api/v4/auth",
    "maiswan/scharles-client.server": "wss://localhost:12024",
    "maiswan/scharles-client.modules": JSON.stringify(['wallpaper', 'backdropFilter', 'noise', 'ripple', 'self']),
};

export const ConfigurationContext = createContext<ConfigContextValue | undefined>(undefined);

const ConfigurationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    // Load initial config from localStorage or defaults, whichever non-null
    const [config, setConfig] = useState<Config>(() => {
        const output: Config = defaultConfig;

        Object.entries(defaultConfig).forEach(([k, v]) => {
            output[k as keyof Config] = localStorage.getItem(k) ?? v;
        });
        
        return output;
    });

    // Writeback
    useEffect(() => {
        Object.entries(config).forEach(([k, v]) => {
            localStorage.setItem(k, v);
        });
    }, [config]);

    const setConfigValue = (key: ConfigKey, value: Config[ConfigKey]) => {
        setConfig((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const value: ConfigContextValue = {
        config,
        setConfig: setConfigValue
    };

    return (
        <ConfigurationContext.Provider value={value}>
            {children}
        </ConfigurationContext.Provider>
    );
};

export default ConfigurationProvider;