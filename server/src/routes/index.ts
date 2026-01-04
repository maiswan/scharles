import { Request, Response } from "express";
import PackageJson from "../../package.json";

export const get = async (req: Request, res: Response) => {
    return res.status(200).json({
        program: PackageJson.name,
        author: "maiswan",
        version: PackageJson.version,
    });
}