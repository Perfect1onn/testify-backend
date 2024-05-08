import { sequelize } from "../../db";
import { DataTypes, Model } from "sequelize";

export class OTP extends Model {
	declare id: number;
	declare otp: string;
	declare userId: string;
}

export const OTPEntity = OTP.init(
	{
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
		},
		otp: {
			type: DataTypes.STRING,
		},
	},
	{
		sequelize,
		tableName: "otps",
	}
);
