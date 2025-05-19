export type Module = {
    identifier: string
    isEnabled: boolean;
    isDebug: boolean;
    data: Record<string, unknown>;
    
    enable: () => void;
    disable: () => void;
    toggle: () => void;
    enableDebug: () => void;
    disableDebug: () => void;
    toggleDebug: () => void;
    set: (key: string, value: unknown) => boolean;
};