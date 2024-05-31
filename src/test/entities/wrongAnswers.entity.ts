import { DataTypes, Model } from "sequelize"
import { sequelize } from "../../db"
import { TestSessionEntity } from "./testSession.enitity"
import { QuestionEntity } from "./question.entity"

class WrongAnswer extends Model {
      declare id: number
      declare questionId: number
      declare testSessionId: number
}

export const WrongAnswerEntity = WrongAnswer.init({
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
		},
            questionId: {
                  type: DataTypes.BIGINT
            }
}, {
      sequelize,
      tableName: "wrong_answers",
      timestamps: false
})

TestSessionEntity.hasMany(WrongAnswerEntity, {
      foreignKey: "testSessionId",
	sourceKey: "id",
      onDelete: "CASCADE"
})
WrongAnswerEntity.belongsTo(TestSessionEntity, { foreignKey: "testSessionId" });

QuestionEntity.hasOne(WrongAnswerEntity, {
      foreignKey: "questionId",
	sourceKey: "id",
})
WrongAnswerEntity.belongsTo(QuestionEntity, { foreignKey: "questionId" });

