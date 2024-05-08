import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../db";

class Test extends Model {
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
		},
		authorId: {
			type: DataTypes.BIGINT,
		}
	},
	{
		sequelize,
		tableName: "tests",
	}
);