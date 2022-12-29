import { DataTypes, Model, Sequelize } from 'sequelize';

class T_series extends Model {}

const model = (sequelize: Sequelize, DataType: any) => {
  T_series.init(
    {
      id: {
        type: DataType.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      adminid: {
        type: DataType.INTEGER,
        defaultValue: 1,
      },
      appid: {
        type: DataType.INTEGER,
        defaultValue: 1,
      },
      createdAt: {
        type: DataType.DATE,
        field: 'createdon',
      },
      isactive: {
        type: DataType.INTEGER,
        defaultValue: 1,
      },
      marketcount: {
        type: DataType.INTEGER,
        defaultValue: 0,
      },
      seriesid: {
        type: DataType.INTEGER,
      },
      seriesname: {
        type: DataType.STRING,
      },
      sportid: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      updatedAt: {
        type: DataType.DATE,
        field: 'updatedon',
      },
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'T_series',
      tableName: 't_series',
    },
  );
  return T_series;
};

export default model;
