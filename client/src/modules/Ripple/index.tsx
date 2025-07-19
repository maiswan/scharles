import { useCallback, useRef, useState } from 'react';
import { useRegisterModule } from '../../hooks/useRegisterModule';
import { RippleEffect } from './RippleEffect';
import Debug from '../../components/Debug';

const keyframeKey = "_keyframes"; // keyframe should be applied separately in a <style> rather than to the ripple <div>
const keys = ["width", "height", "position", "borderRadius", "boxShadow", "animation", keyframeKey];

type RippleElement = {
    id: number,
    x: number,
    y: number,
}

const Ripple: React.FC = () => {
    // Plugin
    const [styles, setStyles] = useState<Record<string, unknown>>({});
    const [keyframe, setKeyframe] = useState("");
    const [ripples, setRipples] = useState<RippleElement[]>([]);

    const nextId = useRef(0);

    const eventHandler = useCallback((x: number, y: number) => {
        const newRipple = {
            id: nextId.current++,
            x,
            y,
        };
        setRipples(prev => [...prev, newRipple]);
    }, []);

    const handleRippleComplete = useCallback((id: number) => {
        setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, []);

    const set = useCallback((key: string, value: unknown) => {
        if (!keys.includes(key)) {
            return `Unknown filter ${key}`;
        }
        
        if (key === keyframeKey) {
            setKeyframe(value as string);
            return;
        }
        setStyles(prev => ({ ...prev, [key]: value }));
    }, []);

    // Module
    const identifier = "ripple";
    const state = useRegisterModule(identifier, { set });

    return (
        <div className="fullscreen" onClick={(e) => eventHandler(e.clientX, e.clientY)}>
            <style>@keyframes {keyframe}</style>
            {
                ripples.map(ripple => (
                    <RippleEffect
                        key={ripple.id}
                        x={ripple.x}
                        y={ripple.y}
                        styles={styles}
                        onComplete={() => handleRippleComplete(ripple.id)} />
                ))
            }
            {
                state.isDebug() &&
                <Debug title={identifier} disableDebug={state.disableDebug}>
                    {Object.keys(styles).map(x => <div key={x}>{x} = {String(styles[x])}</div>)}
                    <div>_keyframes = {keyframe}</div>
                    <div>ripples.length = {ripples.length}</div>
                </Debug>
            }
        </div>
    );
};

export default Ripple;