import { useCallback } from "react";
import { Logger, ILogObj } from "tslog";

// Singleton logger instance
export const logger = new Logger<ILogObj>({
    prettyLogTemplate: "{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t",
});

// Custom hook to use a singleton logger
export function useLogger() {
    const trace = useCallback((...args: unknown[]) => logger.trace(...args), []);
    const debug = useCallback((...args: unknown[]) => logger.debug(...args), []);
    const info = useCallback((...args: unknown[]) => logger.info(...args), []);
    const warn = useCallback((...args: unknown[]) => logger.warn(...args), []);
    const error = useCallback((...args: unknown[]) => logger.error(...args), []);
    const fatal = useCallback((...args: unknown[]) => logger.fatal(...args), []);

    return { trace, debug, info, warn, error, fatal }
}