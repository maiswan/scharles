import { forwardRef, useState, useImperativeHandle, ComponentType, useEffect } from 'react';
import { ModularMethods, ModularProps } from './types';

const withModularMethods = <P extends object>(
    WrappedComponent: ComponentType<P & ModularProps>
) => {
    const EnhancedComponent = forwardRef<ModularMethods, P>(
        ({ ...props }, ref) => {
            const [isEnabled, setIsEnabled] = useState(false);
            const [isDebug, setIsDebug] = useState(false);
            const [data, setData] = useState<Record<string, unknown>>({});

            const [childData, setChildData] = useState<ModularProps>({data: data, isDebug: isDebug});

            useEffect(() => {
                setChildData((prev) => ({ ...prev, ["isDebug"]: isDebug, ["data"]: data }));
            }, [isDebug, data]);

            useImperativeHandle(ref, () => ({
                enable: () => setIsEnabled(true),
                disable: () => setIsEnabled(false),
                toggle: () => setIsEnabled(!isEnabled),
                isEnabled: () => isEnabled,

                set: (key: string, value: unknown) => setData((prev) => ({ ...prev, [key]: value })),
                get: (key: string): unknown => data[key],
                
                enableDebug: () => setIsDebug(true),
                disableDebug: () => setIsDebug(false),
                toggleDebug: () => setIsDebug(!isDebug),
                isDebugging: () => isDebug,                
            }));

            return isEnabled ? <WrappedComponent {...(props as P)} {...childData} /> : null;
        }
    );

    EnhancedComponent.displayName = `WithModularMethods(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return EnhancedComponent;
};

export default withModularMethods;