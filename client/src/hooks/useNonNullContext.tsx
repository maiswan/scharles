import { Context, useContext } from "react";
import { useLogger } from "./useLogger";

export default function useNonNullContext<T>(context: Context<T | undefined>) {
    const logger = useLogger();
    const temp = useContext(context);
    if (!temp) {
        logger.fatal("Context must be used within a provider")
        throw new Error(`Context must be used within a provider`);
    }
    return temp;
}