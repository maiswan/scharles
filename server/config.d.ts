export interface Config {
    server: ServerConfig,
    modules: Record<string, ModuleConfig>,
}

export interface ServerConfig {
    port: number,
    rateLimit: rateLimitConfig,
    maxCommandLength: number,
}

export interface rateLimitConfig {
    maxRequests: number,
    cooldownMs: number,
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