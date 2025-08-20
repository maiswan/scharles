import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useLogger } from "./useLogger";
import { useConfigurationContext } from "./ConfigurationContext";

export interface AuthenticationProviderProps {
    children: ReactNode;
}

export interface AuthenticationProviderValues {
    jwt: string | null;
}

const AuthenticationContext = createContext<AuthenticationProviderValues | null>(null);

export function useAuthenticationContext() {
    const context = useContext(AuthenticationContext);
    if (!context) { throw new Error("useAuthenticationContext must be used within a AuthenticationProvider"); }
    return context;
}


const REAUTHENICATION_BUFFER = 10000; // reauthenticate x ms before expiration
const MIN_REAUTHENICATION_INTERVAL = 5000; // reauthenticate no more frequent than x ms

export default function AuthenticationProvider({ children }: AuthenticationProviderProps) {
    const { getConfig } = useConfigurationContext();
    const logger = useLogger();

    const authKey = useMemo(() => getConfig("maiswan/scharles-client.authKey"), []);
    const authServer = useMemo(() => getConfig("maiswan/scharles-client.authServer"), []);

    const [token, setToken] = useState<string | null>(null);
    const isAuthenticatingRef = useRef(false);
    const authenticateIntervalRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        // Prevent strict mode from running this effect twice
        if (authenticateIntervalRef.current) { return; }

        async function authenticate() {

            // Prevent concurrent authentication
            if (isAuthenticatingRef.current) { return null; }
            isAuthenticatingRef.current = true;

            logger.info(`[AuthContext] Authenticating with ${authServer} with key ending in ${authKey.slice(-4)}`);

            try {
                const response = await fetch(authServer, {
                    method: "POST",
                    body: JSON.stringify({ apiKey: authKey }),
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) {
                    logger.error(`[AuthContext] Cannot connect to ${authServer}`);
                    isAuthenticatingRef.current = false;
                    return null;
                }

                const { token }: { token: string } = await response.json();

                logger.debug(`[AuthContext] Received JWT`);
                isAuthenticatingRef.current = false;
                return token;

            } catch (error) {
                logger.error(`[AuthContext]`, error);
                isAuthenticatingRef.current = false;
                return null;
            }
        }

        async function wrapper() {
            const token = await authenticate();

            // Re-set reauthentication interval
            let duration = 0;
            if (token) {
                setToken(token);

                const decoded = jwtDecode(token);
                duration = ((decoded.exp ?? 0) - (decoded.iat ?? 0)) * 1000 - REAUTHENICATION_BUFFER;
            }
            duration = Math.max(MIN_REAUTHENICATION_INTERVAL, duration);

            logger.debug(`[AuthContext] Reauthenticating in ${duration}ms`);

            clearTimeout(authenticateIntervalRef.current);
            authenticateIntervalRef.current = setTimeout(wrapper, duration);
        }

        wrapper();

    }, [authKey, authServer, logger]);

    const value: AuthenticationProviderValues = useMemo(() => ({
        jwt: token
    }), [token]);

    return (
        <AuthenticationContext.Provider value={value}>
            {children}
        </AuthenticationContext.Provider>
    );

}