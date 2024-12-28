import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../db";

export class Variant extends Model {
	declare id: number;
	declare text: string;
	declare isCorrect: boolean;
	declare questionId: number
}

export const VariantEntity = Variant.init(
	{
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
		},
		text: {
			type: DataTypes.TEXT,
		},
		isCorrect: {
			type: DataTypes.BOOLEAN,
		},
	},
	{
		sequelize,
		tableName: "variants",
		timestamps: false,
	}
);
