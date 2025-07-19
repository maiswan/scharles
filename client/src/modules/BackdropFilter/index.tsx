import { useCallback, useState } from 'react';
import { useRegisterModule } from '../../hooks/useRegisterModule';
import Debug from '../../components/Debug';

const filterKeys = ["blur", "brightness", "contrast", "grayscale", "invert", "opacity", "sepia", "saturate", "hue-rotate", "url"];

const toCssFilters = (filters: Record<string, unknown>): string => {
    return Object.entries(filters)
        .filter(([, value]) => value != null)
        .map(([key, value]) => `${key}(${value})`)
        .join(' ');
};

const BackdropFilter: React.FC = () => {
    // Plugin
    const [filters, setFilters] = useState<Record<string, unknown>>({});
    const cssFilters = toCssFilters(filters);

    const set = useCallback((key: string, value: unknown) => {
        if (!filterKeys.includes(key)) {
            return `Unknown fiter ${key}`;
        }
        setFilters(prev => ({ ...prev, [key]: value as string }));
    }, []);

    // Module
    const identifier = "backdropFilter";
    const state = useRegisterModule(identifier, { set });

    if (!state.isEnabled) { return; }
    return (
        <>
            <div className="fullscreen transition-all duration-500" style={{ backdropFilter: cssFilters }} />
            {
                state.isDebug() &&
                <Debug title={identifier} disableDebug={state.disableDebug}>
                    ^{cssFilters}$
                </Debug>
            }
        </>
    );
};

export default BackdropFilter;