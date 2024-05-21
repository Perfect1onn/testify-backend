import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../db";
import { TestEntity } from "./test.entities";
import { UserEntity } from "../../user";

class TestSession extends Model {
	declare id: number;
	declare testId: number;
	declare userId: number;
	declare mode: "exam" | "study";
}

export const TestSessionEntity = TestSession.init(
	{
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
		},
            mode: {
                  type: DataTypes.ENUM,
                  values: ['exam', 'study'],
                  allowNull: false,
            },
		userId: {
			type: DataTypes.BIGINT,
			unique: true
		}
	},
	{
		sequelize,
		tableName: "test_sessions",
	}
);

TestEntity.hasMany(TestSessionEntity, {
	foreignKey: "testId",
	sourceKey: "id",
});
TestSessionEntity.belongsTo(TestEntity, { foreignKey: "testId" });

UserEntity.hasMany(TestSessionEntity, {
	foreignKey: "userId",
	sourceKey: "id",
});
TestSessionEntity.belongsTo(UserEntity, { foreignKey: "userId" });
