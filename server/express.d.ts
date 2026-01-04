import { Logger, ILogObj } from "tslog";
import { Config } from "./config";
import { CommandStore } from "./src/createCommandStore";
import { JwtRolePayload } from "./src/middlewares/verifyJwtHeader";
import { WebSocketHandler } from "./src/websocket/createWebSocketHandler";

declare global {
    namespace Express {
        interface Locals {
            logger: Logger<ILogObj>,
            config: Config,
            commandStore: CommandStore,
            wsHandler: WebSocketHandler;
        }

        interface Request {
            user?: JwtRolePayload
        }
    }
}