import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Module } from '../types';
import { useModule } from '../../hooks/useModule';
import { useLogger } from '../../hooks/useLogger';

const Wallpaper = forwardRef<Module, unknown>((_, ref) => {
    // Module
    const identifier = "wallpaper";
    const acceptedDataKeys = ["source", "periodMs", "transitionMs"]
    const state = useModule(identifier, acceptedDataKeys);
    useImperativeHandle(ref, () => state);
    const logger = useLogger();

    // Plugin
    const [image, setImage] = useState<string | undefined>();
    const [nextImage, setNextImage] = useState<string | undefined>();
    const [isNextImageVisible, setIsNextImageVisible] = useState(true);

    const [source, setSource] = useState("");
    const [periodMs, setPeriodMs] = useState(30000);
    const [transitionMs, setTransitionMs] = useState(1000);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchImage = useCallback(async () => {
        try {
            if (source === "") { return; }

            logger.info(`[wallpaper] Fetching ${source}`);
            const now = Date.now(); // bust cache
            
            const response = await fetch(`${source}?t=${now}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            logger.debug("[wallpaper] RX", {
                size: blob.size,
                type: blob.type
            });
            
            setImage(url);
            setIsNextImageVisible(false);

            await delay(transitionMs);
            setNextImage(url);
            await delay(transitionMs / 2);
            setIsNextImageVisible(true);

            await delay(transitionMs);
        } catch (error) {
            logger.error(`[wallpaper] Fetching ${source} failed`, error);
            return;
        }
    }, [source, transitionMs]);

    useEffect(() => {
        if (state.data.source) { 
            setSource(state.data.source as string);
        }
        if (state.data.periodMs) {
            setPeriodMs(state.data.periodMs as number);
        }
        if (state.data.transitionMs) { 
            setTransitionMs(state.data.transitionMs as number);
        }

        fetchImage();
        const interval = setInterval(fetchImage, periodMs);
        return () => { clearInterval(interval); };
    }, [state.data.source, state.data.periodMs, state.data.transitionMs, fetchImage, periodMs]);

    if (!state.isEnabled) { return; }
    return (
        <div className="w-screen h-screen">
            <img className="absolute w-screen h-screen object-cover object-top" src={image}></img>
            <img className={`absolute w-screen h-screen object-cover object-top transition-opacity ease-in-out ${isNextImageVisible ? "opacity-100" : "opacity-0"}`} style={{ transitionDuration: `${transitionMs}ms` }} src={nextImage}></img>

            {state.isDebug && <div className="absolute m-2 text-white bg-black p-2 px-4 z-100">
                <div className="font-bold">{identifier}</div>
                <div>{source} {periodMs} {transitionMs}</div>
                <div>{image}</div>
                <div>{nextImage}</div>
                <div>{isNextImageVisible + ""}</div>
                <div>{Object.keys(state.data).map(k => <div>{k} {String(state.data[k])}</div>)}</div>
            </div>}
        </div>
    )
});

export default Wallpaper;