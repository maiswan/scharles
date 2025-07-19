import { useCallback, useEffect, useMemo, useState } from "react";
import { useCommandBus } from "./CommandBus";
import { useLogger } from "./useLogger";

export function useRegisterModule(
    identifier: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api: Record<string, (...args: any[]) => any>
) {
    const { register, unregister } = useCommandBus();
    const logger = useLogger();

    const [isEnabled, setIsEnabled] = useState(false);
    const [isDebug, setIsDebug] = useState(false);

    const enable = useCallback(() => {
        setIsEnabled(true);
        logger.info(`[useModule] ${identifier} enabled`);
    }, []);

    const disable = useCallback(() => {
        setIsEnabled(false);
        logger.info(`[useModule] ${identifier} disabled`);
    }, []);

    const toggle = useCallback(() => {
        setIsEnabled((prev) => !prev);
        logger.info(`[useModule] ${identifier} toggled to ${!isEnabled ? 'enabled' : 'disabled'}`);
    }, []);

    const enableDebug = useCallback(() => {
        setIsDebug(true);
        logger.info(`[useModule] ${identifier} debugging enabled`);
    }, []);

    const disableDebug = useCallback(() => {
        setIsDebug(false);
        logger.info(`[useModule] ${identifier} debugging enabled`);
    }, []);

    const toggleDebug = useCallback(() => {
        setIsDebug((prev) => !prev);
        logger.info(`[useModule] ${identifier} toggled to ${!isDebug ? 'enabled' : 'disabled'}`);
    }, []);

    // The final, public-facing API has default implementations which can be overriden by modules
    const methods = useMemo(() => ({
        enable,
        disable,
        toggle,
        isEnabled: () => isEnabled,
        enableDebug,
        disableDebug,
        toggleDebug,
        isDebug: () => isDebug,
        isDebugging: () => isDebug, // backward compatibility
        ...api,
    }), []);

    useEffect(() => {
        register({ identifier, methods });
        return () => unregister(identifier);
    }, []);

    return methods;
}