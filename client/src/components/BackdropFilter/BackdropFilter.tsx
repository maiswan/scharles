import React from 'react';
import withModularMethods from '../withModularMethods';
import { ModularProps } from '../types';

const acceptedFilters = ["blur", "brightness", "contrast", "grayscale", "invert", "opacity", "sepia", "saturate", "hue-rotate", "url"];

const toCssFilters = (filters: Record<string, unknown>): string => {
    return Object.entries(filters)
        .filter(([key, value]) => acceptedFilters.includes(key) && value !== undefined)
        .map(([key, value]) => `${key}(${value})`)
        .join(' ');
};

const BackdropFilterComponent: React.FC<ModularProps> = ({ data, isDebug }) => {
    const cssFilters = toCssFilters(data);

    return (
        <div>
            <div className="w-screen h-screen transition-all duration-500" style={{ backdropFilter: cssFilters }} />
            {
                isDebug && <div className="absolute top-0 left-0 m-2 bg-white p-2 px-4 z-100">
                    <div>{Object.keys(data).map(x => <span key={x}>{x}</span>)}</div>
                    <div>^{cssFilters}$</div>
                </div>
            }
        </div>
    );
};

const BackdropFilter = withModularMethods(BackdropFilterComponent);
export default BackdropFilter;