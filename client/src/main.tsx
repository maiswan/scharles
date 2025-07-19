import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CommandProvider } from './hooks/CommandBus.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <CommandProvider>
            <App />
        </CommandProvider>
    </StrictMode>,
)
