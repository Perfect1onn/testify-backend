import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../db";

export class UserEntity extends Model {
	declare id: number;
	declare name: string;
	declare surname: string;
	declare email: string;
	declare password: string;
	declare refreshToken: string;
	declare ip: number;
	declare isBanned: boolean;
	declare isEmailConfirmed: boolean;
	declare subscription: Date;
}

UserEntity.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		surname: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		refreshToken: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		ip: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		isBanned: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		isEmailConfirmed: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		subscription: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	},
	{
		tableName: "users",
		sequelize,
	}
);
