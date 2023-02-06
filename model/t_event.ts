import { DataTypes, Model, Sequelize } from 'sequelize';

class T_event extends Model {}

const model = (sequelize: Sequelize, DataType: any) => {
  T_event.init(
    {
      id: {
        type: DataType.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      addauto_fancy: {
        type: DataType.BOOLEAN,
        defaultValue: true,
      },
      addauto_fancy_diamond: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      adminid: {
        type: DataType.INTEGER,
        defaultValue: 1,
      },
      appid: {
        type: DataType.INTEGER,
        defaultValue: 1,
      },
      betlock: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      betdelay: {
        type: DataType.INTEGER,
        defaultValue: 5,
      },
      betdelay_bookmaker: {
        type: DataType.INTEGER,
        defaultValue: 0,
      },
      betdelayfancy: {
        type: DataType.INTEGER,
        defaultValue: 0,
      },
      countrycode: {
        type: DataType.STRING,
        defaultValue: 'GBP',
      },
      createdAt: {
        type: DataType.DATE,
        field: 'createdon',
      },
      cricexchageid: {
        type: DataType.INTEGER,
      },
      eventid: {
        type: DataType.INTEGER,
        allowNull: false,
      },
      eventname: {
        type: DataType.STRING,
        allowNull: false,
      },
      fancypause: {
        type: DataType.INTEGER,
        defaultValue: 0,
      },
      fancyprovider: {
        type: DataTypes.STRING,
        defaultValue: 'RS',
      },
      isactive: {
        type: DataTypes.STRING,
        defaultValue: true,
      },
      ismysqlupdated: {
        type: DataTypes.DATE,
      },
      livetv: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      marketcount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      matchstartdate: {
        type: DataTypes.DATE,
      },
      maxbet: {
        type: DataTypes.INTEGER,
        defaultValue: 100000,
      },
      maxbetbookmaker: {
        type: DataTypes.INTEGER,
        defaultValue: 100000,
      },
      maxbetbookmaker2: {
        type: DataTypes.INTEGER,
        defaultValue: 100000,
      },
      maxbetfancy: {
        type: DataTypes.INTEGER,
        defaultValue: 100000,
      },
      minbet: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      minbetbookmaker: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      minbetfancy: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      open_date: {
        type: DataTypes.DATE,
      },
      playermaxbetfancy: {
        type: DataTypes.INTEGER,
        defaultValue: 100000,
      },
      seriesid: {
        type: DataTypes.INTEGER,
      },
      sportid: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      timezone: {
        type: DataTypes.STRING,
        defaultValue: 'GMT',
      },
      totalexposure: {
        type: DataTypes.INTEGER,
        defaultValue: 500000,
      },
      type: {
        type: DataTypes.STRING,
        defaultValue: 'Betfair',
      },
      updatedAt: {
        type: DataType.DATE,
        field: 'updatedon',
      },
      is_redis_updated: {
        type: DataType.STRING,
        defaultValue: true,
      }
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'T_event',
      tableName: 't_event',
    },
  );
  return T_event;
};

export default model;
