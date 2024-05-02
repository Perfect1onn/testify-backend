import { IResponse } from "../types";
import { ErrorHandler } from "./error-handler";

export function sendError(res: IResponse, error: unknown) {
	if (error instanceof ErrorHandler) {
		return res.status(error.code).send(error.message);
	}
	return res.status(500).send(error);
}
