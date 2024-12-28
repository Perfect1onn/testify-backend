import { UserService } from "../user";
import { TestRepository } from "./repository/test.repository";
import { ErrorHandler } from "../utlis";
import { convertapi } from "../main";
import { fromFileWithPath } from "textract";
import { testParser } from "./utils/testParser";
import { sequelize } from "../db";
import { v4 } from "uuid";
import {
	QuestionEntity,
	TestSessionEntity,
	VariantEntity,
	WrongAnswerEntity,
} from "./entities";
import fileUpload from "express-fileupload";
import path from "path";
import fs from "fs/promises";
import { ResultEntity } from "./entities/result.entity";
import { Test } from "./entities/test.entities";

interface Variant {
	text: string;
	isCorrect: boolean;
	questionId: any;
}

export interface Answer {
	questionIds: number[];
	variantIds: number[];
}

export type Mode = "exam" | "study";

export class TestService {
	constructor(
		private readonly userService: UserService,
		private readonly testRepository: TestRepository
	) {}

	async createTest(
		file: fileUpload.UploadedFile | fileUpload.UploadedFile[] | null,
		userId: number
	) {
		if (!file) {
			throw new ErrorHandler("the file was not downloaded", 400);
		}

		if (!userId) {
			throw new ErrorHandler(`userID: ${userId} not entered`, 400);
		}

		const user = await this.userService.getUserById(userId);

		if (!user) {
			throw new ErrorHandler(`user with userId: ${userId} not found`, 404);
		}

		let result: Test | ErrorHandler | undefined;

		if (!Array.isArray(file)) {
			const fileName = `${v4()}${file.name}`;

			const tempFolderPath = path.resolve(__dirname, "temp");
			const filePath = `${tempFolderPath}/${fileName}`;
			await file.mv(filePath);

			const convertedToPDF = await convertapi.convert("pdf", {
				File: filePath,
			});

			await fs.rm(filePath);

			const savedFile = (await convertedToPDF.saveFiles(tempFolderPath))[0];

			fromFileWithPath(
				savedFile,
				{
					preserveLineBreaks: true,
				},
				async (err, text) => {
					if (err) {
						throw new ErrorHandler(err.message, 400);
					}

					await fs.rm(savedFile);

					const questionsWithVariants = testParser(text);

					if (!questionsWithVariants.length) {
						throw new ErrorHandler("has not questions", 400);
					}

					const transaction = await sequelize.transaction();

					try {
						const createdTest = await this.testRepository.createTest(
							file,
							questionsWithVariants.length,
							user.id,
							transaction
						);

						const questions = questionsWithVariants.map(({ description }) => ({
							description,
							testId: createdTest.id,
						}));

						const createdQuestions = await this.testRepository.createQuestions(
							questions,
							transaction
						);

						const variantsWithQuestionId: Variant[] = [];
						questionsWithVariants.forEach(({ variants }, idx) => {
							variants.forEach(({ text, isCorrect }) => {
								variantsWithQuestionId.push({
									text,
									isCorrect,
									questionId: createdQuestions[idx].id,
								});
							});
						});

						await this.testRepository.createVariants(
							variantsWithQuestionId,
							transaction
						);

						await transaction.commit();
						
						result = createdTest;
					} catch (err) {
						await transaction.rollback();
						result = new ErrorHandler("Transaction Error", 400)
					}
				}
			);
		}

		if(result instanceof ErrorHandler){
			throw result
		} else {
			return result
		}
	}

	async getTests(userId: number, filter: "all" | "added" | "my" = "all") {
		if (filter === undefined) {
			throw new ErrorHandler("filter property not defined", 400);
		}

		if (userId) {
			const user = await this.userService.getUserById(userId);

			if (!user) {
				throw new ErrorHandler(`user with userId: ${userId} not found`, 404);
			}
		}

		return await this.testRepository.getTests(userId, filter);
	}

	async getTestById(id: number) {
		return await this.testRepository.getTestById(id);
	}

	async addTest(userId: number | undefined, testId: number | undefined) {
		if (!userId || !testId) {
			throw new ErrorHandler("needed properties not defined", 400);
		}

		return await this.testRepository.addTest(userId, testId);
	}

	async getQuestions(
		testId: number,
		testSessionId: number,
		offset: number,
		mode: Mode
	) {
		if (mode === "exam") {
			const questions = await this.testRepository.getQuestions(
				testId,
				offset,
				50,
				mode
			);

			return {
				questions,
				lastId: questions.at(-1)?.id,
			};
		} else {
			let limit = 15;
			const wrongAnswers = await WrongAnswerEntity.findAll({
				where: {
					testSessionId,
				},
				order: sequelize.random(),
				attributes: ["id"],
				include: [
					{
						model: QuestionEntity,
						include: [
							{
								model: VariantEntity,
							},
						],
					},
				],
			});

			let limitCount = limit - wrongAnswers.length;
			limit = limitCount <= 0 ? 0 : limitCount;

			const questions = await this.testRepository.getQuestions(
				testId,
				offset,
				limit,
				mode
			);

			return {
				questions: [...wrongAnswers, ...questions],
				lastId: questions.length && questions.at(-1)?.id,
				offset: offset + limit,
			};
		}
	}

	async getQuestionsById(questionsIds: string[]) {
		return await QuestionEntity.findAll({
			where: {
				id: questionsIds,
			},
			include: {
				model: VariantEntity,
			},
		});
	}

	// TODO: MODE , перенести логику работы с данными в testRepository
	async checkAnswers(userAnswer: Answer, testSessionId: number, mode: Mode) {
		const correctAnswers = await this.testRepository.getCorrectAnswers(
			userAnswer.questionIds
		);

		userAnswer.variantIds.sort((a, b) => a - b);

		const allWrongAnswers = (
			await WrongAnswerEntity.findAll({
				where: {
					testSessionId,
				},
			})
		).map((answer) => +answer.questionId);

		const wrongAnswers: { questionId: number; testSessionId: number }[] = [];
		const correctAnswersIdsForDelete: number[] = [];

		const result = correctAnswers.map((correctAnswer, idx) => {
			const isAnswerCorrect = +correctAnswer.id === +userAnswer.variantIds[idx];
			const questionId = +correctAnswer.questionId;
			console.log(questionId, typeof questionId)
			const hasAnswerInDB = allWrongAnswers.includes(questionId);

			if (!isAnswerCorrect) {
				if (!hasAnswerInDB) {
					wrongAnswers.push({
						questionId,
						testSessionId,
					});
				}
			} else if (hasAnswerInDB) {
				correctAnswersIdsForDelete.push(questionId);
			}

			return {
				correctAnswer: correctAnswer,
				isCorrect: isAnswerCorrect,
				userAnswerQuestionId: userAnswer.variantIds[idx],
			};
		});

		if (mode === "study") {
			await WrongAnswerEntity.destroy({
				where: {
					testSessionId,
					questionId: correctAnswersIdsForDelete,
				},
			});

			await WrongAnswerEntity.bulkCreate(wrongAnswers);
		} else {
			const testSession = await TestSessionEntity.findByPk(testSessionId);
			if (testSession) {
				return await ResultEntity.create({
					userId: testSession.userId,
					testId: testSession.testId,
					mode: "exam",
					totalAnswersCount: userAnswer.questionIds.length,
					correctAnswersCount:
						userAnswer.questionIds.length - wrongAnswers.length,
					wrongAnswersIds: wrongAnswers.map(({ questionId }) => questionId),
				});
			}
		}

		return result;
	}

	async createTestSession(
		testId: number | undefined,
		userId: number | undefined,
		mode: Mode | undefined
	) {
		if (!testId || !userId || !mode) {
			throw new ErrorHandler("propreties not defined", 400);
		}

		const testSession = await this.testRepository.createTestSession(
			testId,
			userId,
			mode
		);
		return testSession;
	}
}
