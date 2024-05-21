import { Controller, Get, Post, Request, Response } from "nestling.js";
import { Mode, TestService } from "./test.service";
import { sendError } from "../utlis";

@Controller("tests")
export class TestController {
	constructor(private readonly testService: TestService) {}

	@Post()
	async createTest(req: Request, res: Response) {
		const file = req.files ? req.files.file : null;
		try {
			await this.testService.createTest(file, req.body.userId);

			return res.sendStatus(201);
		} catch (err) {
			sendError(res, err);
		}
	}

	@Get()
	async getTests(req: Request, res: Response) {
		const { userId, mine } = req.query;

		try {
			const tests = await this.testService.getTests(
				userId ? +userId : undefined,
				mine ? mine === "true" : undefined
			);
			res.status(200).send(tests);
		} catch (err) {
			sendError(res, err);
		}
	}

	@Post("added")
	async addTest(req: Request, res: Response) {
		const { userId, testId } = req.body;

		try {
			res.status(201).send(await this.testService.addTest(userId, testId));
		} catch (err) {
			sendError(res, err);
		}
	}

	@Post("answers")
	async checkAnswers(req: Request, res: Response) {
		const { userAnswer, testSessionId, mode } = req.body;

		try {
			res
				.status(200)
				.send(
					await this.testService.checkAnswers(userAnswer, testSessionId, mode)
				);
		} catch (err) {
			sendError(res, err);
		}
	}

	@Post("sessions")
	async createTestSession(req: Request, res: Response) {
		const { testId, userId, mode } = req.body;

		try {
			res
				.status(201)
				.send(await this.testService.createTestSession(testId, userId, mode));
		} catch (err) {
			sendError(res, err);
		}
	}

	@Get("questions")
	async getQuestions(req: Request, res: Response) {
		const { testId, testSessionId, offset, mode } = req.query;

		try {
			res
				.status(200)
				.send(
					await this.testService.getQuestions(
						+testId!,
						+testSessionId!,
						+offset!,
						mode as Mode
					)
				);
		} catch (err) {
			sendError(res, err);
		}
	}
}
