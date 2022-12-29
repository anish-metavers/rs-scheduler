import { DataTypes, Model, Sequelize } from 'sequelize';

class T_matchfancy extends Model {}

const model = (sequelize: Sequelize, DataType: any) => {
  T_matchfancy.init(
    {
      id: {
        type: DataType.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      addby: {
        type: DataType.STRING,
        defaultValue: 'API',
      },
      createdAt: {
        type: DataType.DATE,
        field: 'createdon',
      },
      eventid: {
        type: DataType.INTEGER,
      },
      fancyid: {
        type: DataType.STRING,
      },
      is_fs_market_inactive: {
        type: DataType.INTEGER,
        defaultValue: 0,
      },
      isactive: {
        type: DataType.BOOLEAN,
        defaultValue: true,
      },
      isplay: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      isresultfinished: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      isshow: {
        type: DataType.BOOLEAN,
        defaultValue: true,
      },
      issuspendedbyadmin: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      matchname: {
        type: DataType.STRING,
      },
      maxliabilitityper_market: {
        type: DataType.INTEGER,
        defaultValue: 0,
      },
      mtype: {
        type: DataType.STRING,
        defaultValue: 'player',
      },
      name: {
        type: DataType.STRING,
      },
      oddstype: {
        type: DataType.STRING,
      },
      provider: {
        type: DataType.STRING,
        defaultValue: 'RS',
      },
      remarks: {
        type: DataType.STRING,
      },
      runnerid: {
        type: DataType.STRING,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      suspendedby: {
        type: DataType.STRING,
      },
      betdelay: {
        type: DataType.INTEGER,
        defaultValue: 0,
      },
      isbettable: {
        type: DataTypes.BOOLEAN,
      },
      maxbet: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      minbet: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      skyfancyid: {
        type: DataType.INTEGER,
      },
      sportname: {
        type: DataType.STRING,
        defaultValue: 'Cricket',
      },
    },
    {
      timestamps: true,
      updatedAt: false,
      sequelize,
      modelName: 'T_matchfancy',
      tableName: 't_matchfancy',
    },
  );
  return T_matchfancy;
};

export default model;
