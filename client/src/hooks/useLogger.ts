import { Logger, ILogObj } from "tslog";

// Singleton logger instance
const logger = new Logger<ILogObj>({
    prettyLogTemplate: "{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t",
});

// Custom hook to use a singleton logger
export function useLogger() {
    const trace = (...args: unknown[]) => logger.trace(...args);
    const debug = (...args: unknown[]) => logger.debug(...args);
    const info =  (...args: unknown[]) => logger.info(...args);
    const warn =  (...args: unknown[]) => logger.warn(...args);
    const error = (...args: unknown[]) => logger.error(...args);
    const fatal = (...args: unknown[]) => logger.fatal(...args);

    return { trace, debug, info, warn, error, fatal };
}