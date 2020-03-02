export class ValueError extends Error {
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, ValueError.prototype);
    }
}
export class WundergroundAPIError extends Error {
    constructor(public statusCode: number = 0, public message: string) {
        super(message);
        Object.setPrototypeOf(this, WundergroundAPIError.prototype);
    }
}
