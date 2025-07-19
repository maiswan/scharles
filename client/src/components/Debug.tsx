import { PropsWithChildren } from "react";

export interface DebugProps {
    title: string,
    disableDebug: () => void,
}

const Debug: React.FC<PropsWithChildren<DebugProps>> = ({ title, disableDebug, children }) => {
    return (
        <div className="debug">
            <div className="flex flex-row gap-x-4">
                <h1 className="flex-1">{title}</h1>
                <button onClick={disableDebug}>X</button>
            </div>
            {children}
        </div>
    )
}

export default Debug;