import axios from 'axios';
import { Cache } from 'cache-manager';

export async function ApiCallHelper(
  { baseUrl, marketIds, joinData },
  cacheManager: Cache,
) {
  let data = [];
  try {
    data = await axios.get(baseUrl + marketIds, { timeout: 2000 });
  } catch (error) {
    // console.log('ApiCallHelper: ', error);
    await SuspendMarkets({ marketIds, joinData }, cacheManager);
  }
  return data;
}

async function SuspendMarkets({ marketIds, joinData }, cacheManager: Cache) {
  const keys: string[] = [];
  const dataToInsertInRedis = [];
  for (let marketId of marketIds.split(',')) {
    // console.log(marketId, joinData[0]);

    const data = joinData.find((i) => i.marketid == marketId);
    // console.log(data);
    keys.push(`${data.eventid}::${data.marketid}`);
  }
  const redisData = await cacheManager.store.mget(...keys);

  //   console.log('--------------------------------');
  for (const i in keys) {
    const data: any = redisData[i];
    if (Array.isArray(data)) {
      for (let item of data) {
        // console.log(Array.isArray(item));
        dataToInsertInRedis.push(keys[i]);
        dataToInsertInRedis.push({ ...item, gstatus: 'SUSPENDED' });
      }
    } else {
      //   console.log(Array.isArray(data));

      dataToInsertInRedis.push(keys[i]);
      console.log(data);

      dataToInsertInRedis.push({ ...data, gstatus: 'SUSPENDED' });
    }
  }
  await cacheManager.store.mset.apply(null, [...dataToInsertInRedis, {}]);
  //   console.log('--------------------------------');
}
