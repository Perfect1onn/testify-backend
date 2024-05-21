import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../db";
import { OTPEntity } from "../../auth/enitites/otp.enitity";
import { TestEntity } from "../../test/entities/test.entities";

export class User extends Model {
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

export const UserEntity = User.init(
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
		surname: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
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

UserEntity.hasMany(OTPEntity, {
	foreignKey: "userId",
	sourceKey: "id",
});

UserEntity.hasMany(TestEntity, {
	foreignKey: {
		name: "authorId"
	},
	sourceKey: "id",

})
TestEntity.belongsTo(UserEntity, {
	foreignKey: "authorId"
});

export const UsersTestsEntity = sequelize.define("users_tests", {}, {
	timestamps: false
});

UserEntity.belongsToMany(TestEntity, {
	through: UsersTestsEntity,
	foreignKey: {
		name: "userId",
	},
});

TestEntity.belongsToMany(UserEntity, {
	through: UsersTestsEntity,
	foreignKey: {
		name: "testId",
	},
});
