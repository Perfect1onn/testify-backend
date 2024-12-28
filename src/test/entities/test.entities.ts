import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../db";
import { QuestionEntity } from "./question.entity";
import { ResultEntity } from "./result.entity";

export class Test extends Model {
	declare id: number
	declare name: string
	declare questionsCount: number
}

export const TestEntity = Test.init(
	{
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		questionsCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		}
	},
	{
		sequelize,
		tableName: "tests",
		timestamps: false
	}
);

TestEntity.hasMany(QuestionEntity, {
	foreignKey: "testId",
	sourceKey: "id",
})
QuestionEntity.belongsTo(TestEntity, { foreignKey: 'testId' });

TestEntity.hasMany(ResultEntity, {
	foreignKey: "testId",
	sourceKey: "id",
})
ResultEntity.belongsTo(TestEntity, { foreignKey: 'testId' });