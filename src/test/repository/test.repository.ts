import fileUpload from "express-fileupload";
import {
	TestEntity,
	QuestionEntity,
	VariantEntity,
	TestSessionEntity,
} from "../entities";
import { Includeable, QueryTypes, Transaction } from "sequelize";
import { UserEntity, UsersTestsEntity } from "../../user/entites/user.enitity";
import { Mode } from "../test.service";
import { sequelize } from "../../db";
import { Question } from "../entities/question.entity";

export class TestRepository {
	async createTest(
		file: fileUpload.UploadedFile,
		questionsCount: number,
		userId: number,
		transaction: Transaction
	) {
		const createdTest = await TestEntity.create(
			{
				name: file.name,
				questionsCount: questionsCount,
				authorId: userId,
			},
			{
				transaction,
			}
		);

		await UsersTestsEntity.create(
			{
				userId,
				testId: createdTest.id,
			},
			{
				transaction,
			}
		);

		return createdTest;
	}

	async createQuestions(questions: any, transaction: Transaction) {
		return await QuestionEntity.bulkCreate(questions, {
			transaction,
		});
	}

	async createVariants(variants: any, transaction: Transaction) {
		return await VariantEntity.bulkCreate(variants, {
			transaction,
		});
	}

	async getTests(userId: number | undefined, mine: boolean) {
		const includeOptions: Includeable = {
			model: TestEntity,
			through: {
				attributes: [],
			},
		};

		if (mine) {
			includeOptions.where = {
				authorId: userId,
			};
		} else {
			includeOptions.include = [
				{
					model: UserEntity,
					attributes: ["id", "name", "surname", "email", "isEmailConfirmed"],
				},
			];
		}

		return userId
			? await UserEntity.findByPk(userId, {
					include: [includeOptions],
					attributes: ["id", "name", "surname", "email", "isEmailConfirmed"],
			  })
			: await TestEntity.findAll({
					include: {
						model: UserEntity,
						attributes: ["id", "name", "surname", "email", "isEmailConfirmed"],
					},
			  });
	}

	async addTest(userId: number, testId: number) {
		return await UsersTestsEntity.create({
			userId,
			testId,
		});
	}

	async getQuestions(
		testId: number,
		offset: number,
		limit: number,
		mode: Mode
	): Promise<Question[]> {
		if (mode === "study") {
			return await sequelize.query(
				`WITH ranked_questions AS (
					SELECT 
					    q.id,
					    q.description,
					    q."testId",
					    ROW_NUMBER() OVER (ORDER BY q.id) AS question_row
					FROM 
					    questions q
					WHERE 
					    q."testId" = :testId
				  )
				  SELECT 
					q.id,
					q.description,
					q."testId",
					json_agg(
					    json_build_object(
						  'id', v.id,
						  'text', v.text,
						  'isCorrect', v."isCorrect",
						  'questionId', v."questionId"
					    ) ORDER BY RANDOM()
					) AS "Variants"
				  FROM 
					ranked_questions q
				  LEFT JOIN 
					variants v ON q.id = v."questionId"
				  WHERE 
					q."testId" = :testId
					AND q.question_row BETWEEN :offset + 1 AND :offset + :limit
				  GROUP BY
					q.id, q.description, q."testId"
				  ORDER BY 
					q.id;								
		  `,
				{
					type: QueryTypes.SELECT,
					replacements: {
						offset,
						limit,
						testId,
					},
				}
			);
		} else {
			return QuestionEntity.findAll({
				where: {
					testId,
				},
				order: sequelize.random(),
				limit,
				include: [
					{
						model: VariantEntity,
					},
				],
			});
		}
	}

	async getCorrectAnswers(questionIds: number[]) {
		return await VariantEntity.findAll({
			where: {
				questionId: questionIds,
				isCorrect: true,
			},
		});
	}

	async createTestSession(testId: number, userId: number, mode: Mode) {
		return await TestSessionEntity.create({
			testId,
			userId,
			mode,
		});
	}
}
