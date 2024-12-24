import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../db";
import { OTPEntity } from "../../auth/enitites/otp.enitity";
import { TestEntity } from "../../test/entities/test.entities";
import { ResultEntity } from "../../test/entities/result.entity";
import { CredentialEntity } from "../../auth/enitites/credential.entity";

export class User extends Model {
	declare id: number;
	declare name: string;
	declare surname: string;
	declare email: string;
	declare refreshToken: string;
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
		refreshToken: {
			type: DataTypes.STRING,
			allowNull: true,
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
	as: 'author',
	foreignKey: {
		name: "authorId"
	},
	sourceKey: "id",

})
TestEntity.belongsTo(UserEntity, {
	as: 'author',
	foreignKey: "authorId"
});

export const UsersTestsEntity = sequelize.define("users_tests", {}, {
	timestamps: false
});

UserEntity.belongsToMany(TestEntity, {
	through: UsersTestsEntity,
	as: 'tests',
	foreignKey: {
		name: "userId",
	},
});

TestEntity.belongsToMany(UserEntity, {
	through: UsersTestsEntity,
	as: 'users',
	foreignKey: {
		name: "testId",
	},
});


UserEntity.hasMany(ResultEntity, {
	foreignKey: "userId",
	sourceKey: "id",
})
ResultEntity.belongsTo(UserEntity, { foreignKey: 'userId' });

UserEntity.hasOne(CredentialEntity, { foreignKey: 'userId' });