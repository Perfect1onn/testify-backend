import { sequelize } from "../../db";
import { DataTypes, Model } from "sequelize";

export class Challenge extends Model {
	declare id: number;
	declare challenge: string;
	declare email: string;
}

export const ChallengeEntity = Challenge.init({
	id: {
		type: DataTypes.BIGINT,
		primaryKey: true,
		autoIncrement: true,
	},
	challenge: {
		type: DataTypes.STRING,
	},
	email: {
		type: DataTypes.STRING,
		unique: true
	}
}, {
	sequelize,
	tableName: 'challenges',
	timestamps: false
});
