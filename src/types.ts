import { Nestling, Request, Response } from "nestling.js";

declare global {
		interface Request {
			salam: string;
		}
}
