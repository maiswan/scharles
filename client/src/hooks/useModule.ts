import { useState, useCallback } from 'react';
import { Module } from '../modules/types';
import { useLogger } from './useLogger';

export function useModule(identifier: string, acceptedDataKeys: string[] = []): Module {
    const [isEnabled, setIsEnabled] = useState(false);
    const [IsDebug, setIsDebug] = useState(false);
    const [data, setData] = useState<Record<string, unknown>>({});
    const logger = useLogger();

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
        logger.info(`[useModule] ${identifier} toggled to ${!IsDebug ? 'enabled' : 'disabled'}`);
    }, []);

    const set = useCallback((key: string, value: unknown) => {
        if (!acceptedDataKeys.includes(key)) {
            logger.warn(`[useModule] ${identifier} set ${key} rejected`);
            return false;
        }

        setData((prev) => ({ ...prev, [key]: value }))
        logger.info(`[useModule] ${identifier} set ${key} = ${value}`);
        return true;
    }, []);

    return {
        identifier: identifier,
        isEnabled,
        isDebug: IsDebug,
        data,
        enable,
        disable,
        toggle,
        enableDebug,
        disableDebug,
        toggleDebug,
        set,
    };
}
