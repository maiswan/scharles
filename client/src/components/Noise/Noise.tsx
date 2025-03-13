import React, { useEffect } from 'react';
import withModularMethods from '../withModularMethods';
import { ModularProps } from '../types';
import image from "./noise.png";

const NoiseComponent: React.FC<ModularProps> = ({ data, isDebug }) => {
    // Plugin
    const [opacity, setOpacity] = React.useState(1.0);

    useEffect(() => {
        if (data.opacity) { setOpacity(data.opacity as number); }
    }, [data]);

    return (
        <div>
            <div className="w-screen h-screen bg-repeat transition-opacity duration-500" style={{ backgroundImage: `url(${image}`, opacity: `${opacity}` }} />
            {
                isDebug && <div className="absolute top-0 left-0 m-2 bg-white p-2 px-4 z-100">
                    <div>{image}</div>
                    <div>{opacity}</div>
                </div>
            }
        </div>
    );
};

const Noise = withModularMethods(NoiseComponent);
export default Noise;