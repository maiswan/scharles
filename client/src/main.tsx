import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CommandProvider } from './hooks/CommandBus.tsx'
import AuthenticationProvider from './hooks/AuthenticationContext.tsx'
import ConfigurationProvider from './hooks/ConfigurationContext.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ConfigurationProvider>
            <AuthenticationProvider>
                <CommandProvider>
                    <App />
                </CommandProvider>
            </AuthenticationProvider>
        </ConfigurationProvider>
    </StrictMode>,
)
