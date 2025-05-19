import { forwardRef, MouseEvent, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Module } from '../types';
import { useModule } from '../../hooks/useModule';
import { RippleEffect } from './RippleEffect';

const keyframeIdentifier = "_keyframes"; // keyframe should be applied separately in a <style> rather than to the ripple <div>
const acceptedFilters = ["width", "height", "position", "borderRadius", "boxShadow", "animation", keyframeIdentifier];

const Ripple = forwardRef<Module, unknown>((_, ref) => {
    const identifier = "ripple";
    const state = useModule(identifier, acceptedFilters);
    useImperativeHandle(ref, () => state);

    const [styles, setStyles] = useState<Record<string, unknown>>({});
    const [keyframe, setKeyframe] = useState("");
    const [ripples, setRipples] = useState<Array<{
        id: number;
        x: number;
        y: number;
    }>>([]);
    
    const nextId = useRef(0);

    const eventHandler = (e: MouseEvent<HTMLDivElement>) => {
        const newRipple = {
            id: nextId.current++,
            x: e.clientX,
            y: e.clientY
        };
        setRipples(prev => [...prev, newRipple]);
    };

    const handleRippleComplete = (id: number) => {
        setRipples(prev => prev.filter(ripple => ripple.id !== id));
    };

    function getStyles(data: Record<string, unknown>): Record<string, unknown> {
        if (data === undefined) { return {}; }

        const newStyle: Record<string, unknown> = ({});

        Object.entries(data).forEach(([key, value]) => {
            if (value == null) { return; }
            if (key === keyframeIdentifier) { return; }
            newStyle[key] = value;
        })
    
        return newStyle;
    }

    useEffect(() => {
        if (state.data) { setStyles(getStyles(state.data)); }
        if (state.data._keyframes) { setKeyframe(state.data._keyframes as string); }
    }, [state.data]);

    return (
        <div className="w-screen h-screen" onClick={(e) => eventHandler(e)}>
            <style>@keyframes {keyframe}</style>
            { ripples.map(ripple => (
                <RippleEffect
                    key={ripple.id}
                    x={ripple.x}
                    y={ripple.y}
                    styles={styles}
                    onComplete={() => handleRippleComplete(ripple.id)}/>
            ))}
            {
                state.isDebug && <div className="absolute top-0 left-0 m-2 bg-white p-2 px-4 z-100">
                    <div className="font-bold">{identifier}</div>
                    <div>{Object.keys(styles).map(x => <div key={x}>{x} = {styles[x] + ""}</div>)}</div>
                    <div>_keyframes = {keyframe}</div>
                </div>
            }
        </div>
    );
});

export default Ripple;