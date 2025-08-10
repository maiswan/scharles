export interface Config {
    server: ServerConfig,
    modules: Record<string, ModuleConfig>,
}

export interface ServerConfig {
    port: number,
    rateLimit: RateLimitConfig,
    maxCommandLength: number,
    forceServeIncompatibleClients: boolean,
    keys: KeyConfig
    maxCommandHistorySaved: number,
}

export interface RateLimitConfig {
    maxRequests: number,
    cooldownMs: number,
}

export interface KeyConfig {
    clients: string[],
    controllers: string[],
    admins: string[],
    jwtSecret: string,
    jwtExpiration: string,
    crtPath: string,
    keyPath: string,
}

export interface ModuleConfig {
    public: ModulePublicConfig,
    private: ModulePrivateConfig?,
}

export interface ModulePublicSectionConfig {
    isEnabled: boolean,
    isDebug: boolean,
    data: Record<string, unknown>,
}

export interface ModulePrivateConfig {
    data: Record<string, unknown>,
}