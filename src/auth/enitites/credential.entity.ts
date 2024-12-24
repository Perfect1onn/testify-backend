import { sequelize } from "../../db";
import { DataTypes, Model } from "sequelize";

export class Credential extends Model {
	declare id: string;
	declare publicKey: string;
	declare algorithm: string;
	declare transports: string;
}


export const CredentialEntity = Credential.init(
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		publicKey: {
			type: DataTypes.STRING,
			unique: true
		},
		algorithm: {
			type: DataTypes.STRING,
		},
		transports: {
			type: DataTypes.STRING,
		}
	},
	{
		sequelize,
		tableName: "credentials",
	}
);
