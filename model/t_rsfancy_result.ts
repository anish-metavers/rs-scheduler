import { DataTypes, Model, Sequelize } from 'sequelize';

class T_rsfancy_result extends Model {}

const model = (sequelize: Sequelize, DataType: any) => {
  T_rsfancy_result.init(
    {
      id: {
        type: DataType.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      createdAt: {
        type: DataType.DATE,
        field: 'createdon',
      },
      fancyid: {
        type: DataType.STRING,
      },
      isresultset: {
        type: DataType.INTEGER,
        defaultValue: 0,
      },
      matchid: {
        type: DataType.INTEGER,
      },
      result: {
        type: DataType.STRING,
      },
    },
    {
      timestamps: true,
      updatedAt: false,
      sequelize,
      modelName: 'T_rsfancy_result',
      tableName: 't_rsfancy_result',
    },
  );
  return T_rsfancy_result;
};

export default model;
