import { DataTypes, Sequelize } from 'sequelize';
import T_event from './t_event';
import T_series from './t_series';
import T_selectionid from './t_selectionid';
import T_market from './t_market';
import T_matchfancy from './t_matchfancy';
import T_rsfancy_result from './t_rsfancy_result';

const DATABASE = async () => {
  const sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.ROOT,
    process.env.PASSWORD,
    {
      host: process.env.HOST,
      port: Number(process.env.PORT),
      dialect: 'mysql',
      logging: false,
    },
  );
  try {
    await sequelize.authenticate();
    console.log('---- !!MySQL DB Connected Successfully!! ----');
    const db = {
      sequelize: sequelize,
      T_event: T_event(sequelize, DataTypes),
      T_series: T_series(sequelize, DataTypes),
      T_market: T_market(sequelize, DataTypes),
      T_selectionid: T_selectionid(sequelize, DataTypes),
      T_matchfancy: T_matchfancy(sequelize, DataTypes),
      T_rsfancy_result: T_rsfancy_result(sequelize, DataTypes),
    };

    //await sequelize.sync({ force: true });

    global.DB = db;
  } catch (error) {
    console.error('##Unable to connect to the database !!', error);
  }
};

export default DATABASE;
