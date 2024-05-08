import { Response } from "nestling.js";
import { ErrorHandler } from "./error-handler";

export function sendError(res: Response, error: unknown) {
	if (error instanceof ErrorHandler) {
		return res.status(error.code).send(error.message);
	}
	console.log(error)
	return res.status(500).send(error);
}
