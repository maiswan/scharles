import { useContext, useEffect, useState } from "react";
import { CommandContext } from "./CommandBus";
import { useLogger } from "./useLogger";

export function useRegisterModule(
    identifier: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api: Record<string, (...args: any[]) => any>
) {
    const { register, unregister } = useContext(CommandContext);
    const logger = useLogger();

    const [isEnabled, setIsEnabled] = useState(false);
    const [isDebug, setIsDebug] = useState(false);

    const enable = () => {
        setIsEnabled(true);
        logger.info(`[useModule] ${identifier} enabled`);
    };

    const disable = () => {
        setIsEnabled(false);
        logger.info(`[useModule] ${identifier} disabled`);
    };

    const toggle = () => {
        setIsEnabled((prev) => {
            logger.info(`[useModule] ${identifier} toggled to ${!prev ? 'enabled' : 'disabled'}`);
            return !prev
        });
    };

    const enableDebug = () => {
        setIsDebug(true);
        logger.info(`[useModule] ${identifier} debugging enabled`);
    };

    const disableDebug = () => {
        setIsDebug(false);
        logger.info(`[useModule] ${identifier} debugging enabled`);
    };

    const toggleDebug = () => {
        setIsDebug((prev) => {
            logger.info(`[useModule] ${identifier} debugging toggled to ${!prev ? 'enabled' : 'disabled'}`);
            return !prev
        });
    };

    // The final, public-facing API has default implementations which can be overriden by modules
    const methods = {
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
    };

    useEffect(() => {

        register({ identifier, methods });
        return () => unregister(identifier);

    }, []);

    return methods;
}