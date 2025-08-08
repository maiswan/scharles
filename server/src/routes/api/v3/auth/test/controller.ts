import { Request, Response } from "express";
import authenticateJwt from "../../../../../middlewares/jwt";

// Debugging endpoint for users to test if they're authenticated
// If so, return what we know about them
export const get = [
    authenticateJwt("controller"),
    (req: Request, res: Response) => {
        res.status(200).json({ ...(req as any).user });
    }
]