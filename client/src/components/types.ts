// types.ts
export interface ModularMethods {
    enable: () => void;
    disable: () => void;
    toggle: () => void;
    isEnabled: () => boolean;

    set: (key: string, value: unknown) => void;
    get: (key: string) => unknown;

    enableDebug: () => void;
    disableDebug: () => void;
    toggleDebug: () => void;
    isDebugging: () => boolean;
}
  
export interface ModularProps {
    data: Record<string, unknown>;
    isDebug: boolean;
}