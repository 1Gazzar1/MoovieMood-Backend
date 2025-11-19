export class CustomError extends Error {
    statusCode: number;
    constructor(name: string, statusCode: number, message: string) {
        super();
        this.name = name;
        this.statusCode = statusCode;
        this.message = message;
    }
}

export function createError(
    name: string = "Error",
    statusCode: number = 500,
    message: string
): CustomError {
    const customError = new CustomError(name, statusCode, message);
    return customError;
}

export const ERRORS = {
    NOTFOUND: (message: string) => createError("NOTFOUND", 404, message),
    BAD_REQUEST: (message: string) => createError("BAD_REQUEST", 400, message),
    INTERNAL: (message: string) => createError("INTERNAL", 500, message),
} as const;
