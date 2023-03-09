import { DataTypes, Model, Sequelize } from 'sequelize';

class T_market extends Model {}

const model = (sequelize: Sequelize, DataType: any) => {
  T_market.init(
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
      eventid: {
        type: DataType.INTEGER,
      },
      // is_fs_market_inactive: {
      //   type: DataType.INTEGER,
      //   defaultValue: 0,
      // },
      inplay: {
        type: DataType.STRING,
      },
      // is_result: {
      //   type: DataType.STRING,
      //   defaultValue: 0,
      // },
      // is_fs_pushed: {
      //   type: DataTypes.INTEGER,
      //   defaultValue: 0,
      // },
      isactive: {
        type: DataTypes.STRING,
        defaultValue: true,
      },
      // ispause: {
      //   type: DataType.INTEGER,
      //   defaultValue: 0,
      // },
      // isresultfinished: {
      //   type: DataTypes.INTEGER,
      //   defaultValue: 0,
      // },
      marketid: {
        type: DataTypes.STRING,
      },
      marketname: {
        type: DataTypes.STRING,
      },
      matchname: {
        type: DataTypes.STRING,
      },
      // odds_suspension_on_bm_status: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: true,
      // },
      // oddsprovider: {
      //   type: DataTypes.STRING,
      //   defaultValue: 'RS',
      // },
      opendate: {
        type: DataTypes.DATE,
      },
      // pause_by_admin: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: true,
      // },
      // resultstatuscron: {
      //   type: DataTypes.INTEGER,
      // },
      seriesid: {
        type: DataTypes.INTEGER,
      },
      sportid: {
        type: DataTypes.INTEGER,
      },
      startdate: {
        type: DataTypes.DATE,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updatedon',
      },
      max_bet_rate: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      min_bet_rate: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      betdelay: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
      },
      minbet: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
      },
      maxbet: {
        type: DataTypes.INTEGER,
        defaultValue: 10000,
      },
      is_redis_updated: {
        type: DataTypes.STRING,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'T_market',
      tableName: 't_market',
    },
  );
  return T_market;
};

export default model;
