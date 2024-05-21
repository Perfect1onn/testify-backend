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
	VariantEntity,
	WrongAnswerEntity,
} from "./entities";
import fileUpload from "express-fileupload";
import path from "path";
import fs from "fs/promises";

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
					} catch (err) {
						await transaction.rollback();
						throw new ErrorHandler("Transaction Error", 400);
					}
				}
			);
		}
	}

	async getTests(userId: number | undefined, mine: boolean | undefined) {
		if (mine === undefined) {
			throw new ErrorHandler("mine property not defined", 400);
		}

		if (userId) {
			const user = await this.userService.getUserById(userId);

			if (!user) {
				throw new ErrorHandler(`user with userId: ${userId} not found`, 404);
			}
		}

		return await this.testRepository.getTests(userId, mine);
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
				questions: [...questions, ...wrongAnswers],
				lastId: questions.length && questions.at(-1)?.id,
			};
		}
	}

	// TODO: MODE , перенести логику работы с данными в testRepository
	async checkAnswers(userAnswer: Answer, testSessionId: number, mode: Mode) {
		const correctAnswers = await this.testRepository.getCorrectAnswers(
			userAnswer.questionIds
		);

		userAnswer.variantIds.sort(((a, b) => a - b))

		const allWrongAnswers = (await WrongAnswerEntity.findAll()).map(
			(answer) => +answer.questionId
		);

		const wrongAnswers: { questionId: number; testSessionId: number }[] = [];
		const correctAnswersIdsForDelete: number[] = [];

		const result = correctAnswers.map((correctAnswer, idx) => {
			const isAnswerCorrect = +correctAnswer.id === userAnswer.variantIds[idx];
			const questionId = userAnswer.questionIds[idx];
			const hasAnswerInDB = allWrongAnswers.includes(questionId);

			if (!isAnswerCorrect) {
				if (!hasAnswerInDB)
					wrongAnswers.push({
						questionId,
						testSessionId,
					});
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
					questionId: correctAnswersIdsForDelete,
				},
			});

			await WrongAnswerEntity.bulkCreate(wrongAnswers);
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
		return {
			testSession,
			...(await this.getQuestions(testId, testSession.id, 0, mode)),
		};
	}
}
