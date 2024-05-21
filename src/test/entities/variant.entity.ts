import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../db";

export class Variant extends Model {
	declare id: number;
	declare text: string;
	declare isCorrect: boolean;
}

export const VariantEntity = Variant.init(
	{
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
		},
		text: {
			type: DataTypes.STRING,
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
