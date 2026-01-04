import { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useLogger } from "./useLogger";
import { ConfigurationContext } from "./ConfigurationContext";
import useNonNullContext from "./useNonNullContext";

export const AuthenticationContext = createContext<string | undefined>(undefined);

const REAUTH_BUFFER = 10000; // reauthenticate x ms before expiration
const MIN_REAUTH_INTERVAL = 5000; // reauthenticate no more frequent than x ms

const AuthenticationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const logger = useLogger();
    const { config } = useNonNullContext(ConfigurationContext);
    const authKey = config["maiswan/scharles-client.authKey"];
    const authServer = config["maiswan/scharles-client.authServer"];

    const [token, setToken] = useState<string | undefined>(undefined);
    const isAuthenticatingRef = useRef(false);
    const intervalRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        async function fetchJwt(authServer: string, authKey: string) {

            // Only allow one authentication in progress at a time
            if (isAuthenticatingRef.current) { return MIN_REAUTH_INTERVAL; }
            isAuthenticatingRef.current = true;

            logger.info(`[AuthContext] Authenticating with ${authServer} with key ending in ${authKey.slice(-4)}`);
            try {
                const response = await fetch(authServer, {
                    method: "POST",
                    body: JSON.stringify({ apiKey: authKey }),
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) { throw new Error(`${authServer} did not respond properly`); }

                const { token }: { token: string } = await response.json();

                logger.debug(`[AuthContext] Received JWT`);

                const { exp, iat } = jwtDecode(token);
                if (!exp || !iat) { throw new Error(`JWT has malformed exp=${exp} or iat=${iat}`); }

                const reauthInterval = Math.max(MIN_REAUTH_INTERVAL, (exp - iat) * 1000 - REAUTH_BUFFER);
                setToken(token);
                return reauthInterval;

            } catch (error) {
                logger.error(`[AuthContext]`, error);
                return MIN_REAUTH_INTERVAL;

            } finally {
                isAuthenticatingRef.current = false;
            }
        }

        const setupInterval = async () => {
            const reauthInterval = await fetchJwt(authServer, authKey);
            window.clearInterval(intervalRef.current);
            intervalRef.current = window.setInterval(() => fetchJwt(authServer, authKey), reauthInterval);
        };

        setupInterval();

        return () => {
            clearInterval(intervalRef.current);
        };

    }, [authKey, authServer]);

    return (
        <AuthenticationContext.Provider value={token}>
            {children}
        </AuthenticationContext.Provider>
    );
};

export default AuthenticationProvider;