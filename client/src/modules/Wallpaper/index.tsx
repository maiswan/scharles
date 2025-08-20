import { useCallback, useEffect, useRef, useState } from 'react';
import { useRegisterModule } from '../../hooks/useRegisterModule';
import { useLogger } from '../../hooks/useLogger';
import Debug from '../../components/Debug';
import { useAuthenticationContext } from '../../hooks/AuthenticationContext';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Wallpaper: React.FC = () => {
    // Plugin
    const [source, setSource] = useState("");
    const [periodMs, setPeriodMs] = useState(30000);
    const [transitionMs, setTransitionMs] = useState(1000);
    const isPausedRef = useRef(false);

    const { jwt } = useAuthenticationContext();
    const logger = useLogger();

    // Derived
    const [refetch, setRefetch] = useState(0);
    const isTransiting = useRef(false);
    const previousObjectUrl = useRef("");

    const bottomImageRef = useRef<HTMLImageElement | null>(null);
    const topImageRef = useRef<HTMLImageElement | null>(null);

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

    const next = useCallback(() => setRefetch(prev => 1 - prev), []);

    const fetchAndCrossFadeImage = useCallback(async (jwt: string | null, source: string, transitionMs: number) => {
        if (!jwt) { return; }
        if (!bottomImageRef.current) { return; }
        if (!topImageRef.current) { return; }

        logger.debug(`[wallpaper] Fetching ${source}`);
        isTransiting.current = true;
        URL.revokeObjectURL(previousObjectUrl.current);

        try {
            const response = await fetch(source, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
            });

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            previousObjectUrl.current = objectUrl;

            // hide top image and swap with new image
            bottomImageRef.current.src = objectUrl;
            topImageRef.current.style.opacity = "0";

            await delay(transitionMs);

            topImageRef.current.src = objectUrl;
            topImageRef.current.style.opacity = "1";

        } catch (error) {
            logger.error(`[wallpaper]`, error);
        }

    }, [logger]);

    // Fetch on interval
    useEffect(() => {

        fetchAndCrossFadeImage(jwt, source, transitionMs);

        const interval = setInterval(() => fetchAndCrossFadeImage(jwt, source, transitionMs), periodMs);
        return () => clearInterval(interval);

    }, [fetchAndCrossFadeImage, periodMs, jwt, source, transitionMs, refetch]);

    // Module
    const identifier = "wallpaper";
    const state = useRegisterModule(
        identifier,
        { set, next, pause, unpause, isPaused }
    );

    if (!state.isEnabled()) { return; }
    return (
        <>
            <img ref={bottomImageRef} className="fullscreen object-cover object-top"></img>
            <img ref={topImageRef} className="fullscreen object-cover object-top transition-opacity duration-1000 ease-in-out" style={{ transitionDuration: `${transitionMs}ms` }}></img>

            {
                state.isDebug() &&
                <Debug title={identifier} disableDebug={state.disableDebug}>
                    <div>{source} {periodMs} {transitionMs} {refetch}</div>
                </Debug>
            }
        </>
    )
};

export default Wallpaper;