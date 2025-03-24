import { useState, useImperativeHandle, ComponentType } from 'react';
import { ModularMethods, ModularProps } from './types';

const withModularMethods = <P extends object>(
    WrappedComponent: ComponentType<P & ModularProps>
) => {
    const EnhancedComponent = ({ ref, ...props }: P & { ref?: React.Ref<ModularMethods> }) => {
        const [isEnabled, setIsEnabled] = useState(false);
        const [isDebug, setIsDebug] = useState(false);
        const [data, setData] = useState<Record<string, unknown>>({});

        useImperativeHandle(ref, () => ({
            enable: () => setIsEnabled(true),
            disable: () => setIsEnabled(false),
            toggle: () => setIsEnabled((prev) => !prev),
            isEnabled: () => isEnabled,

            set: (key: string, value: unknown) => setData((prev) => ({ ...prev, [key]: value })),
            get: (key: string): unknown => data[key],

            enableDebug: () => setIsDebug(true),
            disableDebug: () => setIsDebug(false),
            toggleDebug: () => setIsDebug((prev) => !prev),
            isDebugging: () => isDebug,
        }));

        return isEnabled && <WrappedComponent {...(props as P)} {...{ data, isDebug }} />;
    };

    EnhancedComponent.displayName = `WithModularMethods(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return EnhancedComponent;
};

export default withModularMethods;