import { useCallback, useState } from 'react';
import image from "./noise.png";
import { useRegisterModule } from '../../hooks/useRegisterModule';
import Debug from '../../components/Debug';

const Noise: React.FC = () => {
    // Plugin
    const [opacity, setOpacity] = useState(1.0);
    const set = useCallback((key: string, value: unknown) => {
        if (key !== "opacity") { return `Unknown key ${key}`; }
        setOpacity(Number.parseFloat(value as string));
    }, []);
    
    // Module
    const identifier = "noise";
    const state = useRegisterModule(identifier, { set });

    if (!state.isEnabled()) { return; }
    return (
        <>
            <div className="fullscreen bg-repeat transition-opacity duration-500" style={{ backgroundImage: `url(${image}`, opacity: `${opacity}` }} />
            {
                state.isDebug() &&
                <Debug title={identifier} disableDebug={state.disableDebug}>
                    {image} {opacity}
                </Debug>
            }
        </>
    );
};

export default Noise;