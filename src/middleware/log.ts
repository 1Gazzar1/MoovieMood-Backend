import type { NextFunction, Request, Response } from "express";

export const log = (req: Request, res: Response, next: NextFunction) => {
    const { method, url } = req;
    const start = Date.now();
    res.on("finish", () => {
        const end = Date.now();
        const duration = `${end - start}ms`;

        console.table({
            route: `${method} ${url}`,
            duration,
            resCode: res.statusCode,
        });
    });
    next();
    
};
