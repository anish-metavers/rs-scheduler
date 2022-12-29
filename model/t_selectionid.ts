import { DataTypes, Model, Sequelize } from 'sequelize';

class T_selectionid extends Model {}

const model = (sequelize: Sequelize, DataType: any) => {
  T_selectionid.init(
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
      marketid: {
        type: DataType.STRING,
      },
      runner_name: {
        type: DataType.STRING,
      },
      selectionid: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      updatedAt: false,
      sequelize,
      modelName: 'T_selectionid',
      tableName: 't_selectionid',
    },
  );
  return T_selectionid;
};

export default model;
