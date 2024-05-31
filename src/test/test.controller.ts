import { Controller, Get, Post, Request, Response } from "nestling.js";
import { Mode, TestService } from "./test.service";
import { sendError } from "../utlis";
import { authMiddleware } from "../auth/middlewares";
import { TestEntity, TestSessionEntity } from "./entities";
import { UserEntity } from "../user";
import { ResultEntity } from "./entities/result.entity";

@Controller("tests", authMiddleware)
export class TestController {
	constructor(private readonly testService: TestService) {}

	@Post("")
	async createTest(req: Request, res: Response) {
		const file = req.files ? req.files.file : null;
		try {
			return res
				.status(201)
				.send(await this.testService.createTest(file, +req.query.userId!));
		} catch (err) {
			sendError(res, err);
		}
	}

	@Get()
	async getTests(req: Request, res: Response) {
		const { userId, filter } = req.query;

		try {
			const tests = await this.testService.getTests(+userId!, filter as "all");

			res.status(200).send(tests);
		} catch (err) {
			sendError(res, err);
		}
	}

	@Get("test/:id")
	async getTestById(req: Request, res: Response) {
		try {
			const test = await this.testService.getTestById(+req.params.id);
			res.status(200).send(test);
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

	@Get("questions/default")
	async getQuestionsById(req: Request, res: Response) {
		const { questionIds } = req.body;

		try {
			res
				.status(200)
				.send(await this.testService.getQuestionsById(questionIds));
		} catch (err) {
			sendError(res, err);
		}
	}

	@Get("results/:id")
	async getResultById(req: Request, res: Response) {
		try {
			res.status(200).send(await ResultEntity.findByPk(req.params.id));
		} catch (err) {
			sendError(res, err);
		}
	}

	@Post("results")
	async getResults(req: Request, res: Response) {
		const { testId, userId } = req.body;
		try {
			res.status(200).send(
				await ResultEntity.findAll({
					where: {
						testId,
						userId
					},
				})
			);
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

	@Get("sessions/:sessionId")
	async getTestSession(req: Request, res: Response) {
		try {
			res.status(200).send(
				await TestSessionEntity.findByPk(req.params.sessionId, {
					include: [
						{
							model: TestEntity,
							include: [
								{
									model: UserEntity,
									as: "author",
									attributes: ["id", "name", "surname", "email"],
								},
							],
						},
					],
				})
			);
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
