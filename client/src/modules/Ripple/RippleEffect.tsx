import { CSSProperties, useEffect, useRef } from 'react';

interface RippleEffectProps {
    x: number;
    y: number;
    styles: Record<string, unknown>;
    onComplete: () => void;
}

export const RippleEffect = ({ x, y, styles, onComplete }: RippleEffectProps) => {
    const rippleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ripple = rippleRef.current;
        if (!ripple) return;

        ripple.addEventListener('animationend', onComplete);
        return () => ripple.removeEventListener('animationend', onComplete);
    }, [onComplete]);

    const rippleStyles: CSSProperties = {
        ...styles as CSSProperties,
        left: `${x}px`,
        top: `${y}px`,
    };

    return <div ref={rippleRef} style={rippleStyles} />;
};