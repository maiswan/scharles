import React, { MouseEvent } from 'react';
import withModularMethods from '../withModularMethods';
import { ModularProps } from '../types';
import "./ripple.css";

const RippleComponent: React.FC<ModularProps> = ({ data, isDebug }) => {
    function getStyles(data: Record<string, unknown>): Record<string, unknown> {
        if (data === undefined) { return {}; }

        const newStyle: Record<string, unknown> = ({});

        Object.entries(data).forEach(([key, value]) => {
            if (value === null) { return; }

            newStyle[key] = value;
        })
    
        return newStyle;
    }

    const styles = getStyles(data);

    const eventHandler = async (e: MouseEvent<HTMLDivElement>) => {
        // Source: https://dev.to/leonardoschmittk/how-to-make-a-mouse-ripple-click-effect-with-css-js-and-html-in-2-steps-2fcf

        const ripple = document.createElement("div");
        Object.assign(ripple.style, styles);

        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;

        ripple.addEventListener("animationend", () => {
            ripple.remove();
        });

        document.body.appendChild(ripple);
    };

    return (
        <div className="w-screen h-screen" onClick={async (e) => await eventHandler(e)}>
            {
                isDebug && <div className="absolute top-0 left-0 m-2 bg-white p-2 px-4 z-100">
                    <div className="font-bold">Ripple</div>
                    <div>{Object.keys(styles).map(x => <div key={x}>{x} = {styles[x] + ""}</div>)}</div>
                </div>
            }
        </div>
    );
};

const Ripple = withModularMethods(RippleComponent);
export default Ripple;