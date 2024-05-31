import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../db";

class Result extends Model {
	declare id: number;
	declare userId: number;
	declare testId: number;
	declare mode: string;
	declare totalAnswersCount: number;
	declare correctAnswersCount: number;
	declare wrongAnswersIds: number[]
}

export const ResultEntity = Result.init(
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
		},
            testId: {
			type: DataTypes.BIGINT,
		},
            totalAnswersCount: {
                  type: DataTypes.INTEGER,
                  defaultValue: 0
            },
            correctAnswersCount: {
                  type: DataTypes.INTEGER,
                  defaultValue: 0
            },
		wrongAnswersIds: {
			type: DataTypes.ARRAY(DataTypes.INTEGER),
		}
	},
	{
		sequelize,
		tableName: "results",
		timestamps: false,
	}
);
