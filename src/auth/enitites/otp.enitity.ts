import { sequelize } from "../../db";
import { DataTypes, Model } from "sequelize"

class OTPEntity extends Model {
      declare id: number
      declare otp: string
      declare userId: string
}

const model = OTPEntity.init({
      id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
      },
      otp: {
            type: DataTypes.STRING,
      }
}, {
      sequelize,
      tableName: "otps"
})

export default model;

