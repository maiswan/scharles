
export interface Environment {
    Port: number,
    Private: ComponentsMap,
    Public: ComponentsMap,
}

export interface ComponentsMap {
    [index:string]: SettingsMap;
}

export interface SettingsMap {
    isEnabled?: boolean,
    isDebug?: boolean,
    data: Settings
}

export interface Settings {
    [index:string]: unknown;
}