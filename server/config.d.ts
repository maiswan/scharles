export default interface Config {
    server: {
        port: number;
        rateLimit: {
            maxRequests: number;
            cooldownMs: number;
            maxRequestLength: number;
        };
        forceServeIncompatibleClients: boolean;
        maxCommandHistorySaved: number;
        authentication: {
            controllers: AuthRoleConfig;
            admins: AuthRoleConfig;
            jwtSecret: string;
            crtPath: string;
            keyPath: string;
        };
    };
    modules: Record<string, ModuleConfig>;
}

export interface AuthRoleConfig {
    keys: string[];
    jwtExpiration: string;
}

export interface ModuleConfig {
    public: {
        isEnabled: boolean;
        isDebug: boolean;
        data: Record<string, any>;
    };
    private?: {
        data: Record<string, any>;
    };
}
