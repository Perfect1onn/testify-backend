import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../db";
import { VariantEntity } from "./variant.entity";

export class Question extends Model {
	declare id: number;
	declare description: string;
}

export const QuestionEntity = Question.init(
	{
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "questions",
		timestamps: false,
	}
);

QuestionEntity.hasMany(VariantEntity, {
	foreignKey: "questionId",
	sourceKey: "id",
});
VariantEntity.belongsTo(QuestionEntity, { foreignKey: "questionId" });
