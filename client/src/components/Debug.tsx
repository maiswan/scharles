import { PropsWithChildren } from "react";

export interface DebugProps {
    title: string,
    disableDebug: () => void,
}

const Debug: React.FC<PropsWithChildren<DebugProps>> = ({ title, disableDebug, children }) => {
    return (
        <div className="debug">
            <div className="flex flex-row items-center justify-between gap-4 mb-4">
                <h1>{title}</h1>
                <button className="max-w-32" onClick={disableDebug}>X</button>
            </div>
            {children}
        </div>
    )
}

export default Debug;