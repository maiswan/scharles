import React, { useCallback, useEffect, useState } from 'react';
import withModularMethods from '../withModularMethods';
import { ModularProps } from '../types';

const WallpaperComponent: React.FC<ModularProps> = ({ data, isDebug }) => {
    const [image, setImage] = useState<string | undefined>();
    const [nextImage, setNextImage] = useState<string | undefined>();
    const [isNextImageVisible, setIsNextImageVisible] = useState(true);

    // Plugin
    const [source, setSource] = React.useState("");
    const [periodMs, setPeriodMs] = React.useState(30000);
    const [transitionMs, setTransitionMs] = React.useState(1000);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchImage = useCallback(async () => {
        try {
            if (source === "") { return; }

            const now = Date.now(); // bust cache
            const response = await fetch(`${source}?t=${now}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            setImage(url);
            setIsNextImageVisible(false);

            await delay(transitionMs);
            setNextImage(url);
            await delay(transitionMs / 2);
            setIsNextImageVisible(true);

            await delay(transitionMs);
        } catch {
            return;
        }
    }, [source, transitionMs]);


    useEffect(() => {
        if (data.source) { setSource(data.source as string); }
        if (data.periodMs) { setPeriodMs(data.periodMs as number); }
        if (data.transitionMs) { setTransitionMs(data.transitionMs as number); }

        fetchImage();
        const interval = setInterval(fetchImage, periodMs);
        return () => { clearInterval(interval); };
    }, [data, fetchImage, periodMs]);

    return (
        <div className="w-screen h-screen">
            <img className="absolute w-screen h-screen object-cover object-top" src={image}></img>
            <img className={`absolute w-screen h-screen object-cover object-top transition-opacity ease-in-out ${isNextImageVisible ? "opacity-100" : "opacity-0"}`} style={{ transitionDuration: `${transitionMs}ms` }} src={nextImage}></img>

            {isDebug && <div className="absolute m-2 text-white bg-black p-2 px-4 z-100">
                <div className="font-bold">Wallpaper</div>
                <div>{source} {periodMs} {transitionMs}</div>
                <div>{image}</div>
                <div>{nextImage}</div>
                <div>{isNextImageVisible + ""}</div>
            </div>}
        </div>
    )
};

const Wallpaper = withModularMethods(WallpaperComponent);
export default Wallpaper;