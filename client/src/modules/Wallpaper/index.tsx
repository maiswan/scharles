import { useCallback, useEffect, useRef, useState } from 'react';
import { useRegisterModule } from '../../hooks/useRegisterModule';
import { useLogger } from '../../hooks/useLogger';
import Debug from '../../components/Debug';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Wallpaper: React.FC = () => {
    // Plugin
    const [source, setSource] = useState("");
    const [periodMs, setPeriodMs] = useState(30000);
    const [transitionMs, setTransitionMs] = useState(1000);
    const isPausedRef = useRef(false);

    // Derived
    const [refetch, setRefetch] = useState(0);
    const [bottomImage, setBottomImage] = useState<string | undefined>();
    const [topImage, setTopImage] = useState<string | undefined>();
    const [isTopImageVisible, setIsTopImageVisible] = useState(true);
    const isTransiting = useRef(false);
    const previousObjectUrl = useRef("");

    const set = useCallback((key: string, value: unknown) => {
        const string = value as string;
        switch (key) {
            case "source":
                setSource(string);
                return;
            case "periodMs":
                setPeriodMs(Number.parseInt(string));
                return;
            case "transitionMs":
                setTransitionMs(Number.parseInt(string));
                return;
            default:
                return `Unknown key ${key}`;
        }
    }, []);

    const pause = useCallback(() => isPausedRef.current = true, []);
    const unpause = useCallback(() => isPausedRef.current = false, []);
    const isPaused = useCallback(() => isPausedRef.current, []);

    const next = useCallback(() => setRefetch(prev => prev + 1), []);

    const fetchAndCrossFadeImage = useCallback(async () => {
        if (isTransiting.current) { return; }
        if (isPausedRef.current) { return; }
        if (source === "") { return; }

        logger.debug(`[wallpaper] Fetching ${source}`);
        isTransiting.current = true;
        URL.revokeObjectURL(previousObjectUrl.current);

        try {
            const response = await fetch(source);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            previousObjectUrl.current = objectUrl;

            setBottomImage(objectUrl);
            setIsTopImageVisible(false);
            await delay(transitionMs);
            setTopImage(objectUrl);

        } catch (error) {
            console.error("[wallpaper] Fetch failed", error);
        
        } finally {
            setIsTopImageVisible(true);
            isTransiting.current = false;
        }
    }, [source, transitionMs]);

    // Fetch on interval
    useEffect(() => {
        fetchAndCrossFadeImage();
        const interval = setInterval(fetchAndCrossFadeImage, periodMs);
        return () => clearInterval(interval);
    }, [fetchAndCrossFadeImage, periodMs, refetch]);

    // Module
    const identifier = "wallpaper";
    const state = useRegisterModule(
        identifier,
        { set, next, pause, unpause, isPaused }
    );
    const logger = useLogger();

    if (!state.isEnabled()) { return; }
    return (
        <>
            <img src={bottomImage} className="fullscreen object-cover object-top"></img>
            <img src={topImage} className={`fullscreen object-cover object-top transition-opacity ease-in-out ${isTopImageVisible ? "opacity-100" : "opacity-0"}`} style={{ transitionDuration: `${transitionMs}ms` }}></img>

            {
                state.isDebug() &&
                <Debug title={identifier} disableDebug={state.disableDebug}>
                    <div>{source} {periodMs} {transitionMs} {refetch} {isPausedRef.current + ""}</div>
                    <div>{bottomImage}</div>
                    <div>{topImage}</div>
                    <div>{isTopImageVisible + ""}</div>
                </Debug>
            }
        </>
    )
};

export default Wallpaper;