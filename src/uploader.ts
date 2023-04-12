import moment from 'moment'; // For time format as SQL datetime format
import data from '../data.json'; // If use *, default key is added to JSON object
import { defaultData } from '../config/defaultData';
const adminInfo = require('../config/adminInfo');
const dbConfig = require('../config/dbConfig');

// import knex & access DB
const knex = require('knex')({
  client: 'mysql2',
  version: dbConfig.version,
  connection: {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  },
});

async function Uploader() {
  // New object of json data & default data, with local time in SQL datetime format
  let uploadData = Object.entries(data).map((el) => ({
    BBS_SUBJECT: el[1]?.title,
    BBS_DATA: el[1]?.link,
    CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
    UPDATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
    ...defaultData,
  }));

  const latestBBSID = await knex('TB_BBS').max('BBS_ID'); // Get latest BBS_ID

  let i = 0;
  let obj = [];
  while (i < uploadData.length) {
    const bbsIDArray = {
      BBS_ID: Number(Object.values(latestBBSID[0])[0]) + 1 + i,
      BBS_REF: Number(Object.values(latestBBSID[0])[0]) + 1 + i,
    };

    const testArray = { ...uploadData[i], ...bbsIDArray };
    obj.push(testArray);
    i++;
  }

  const webLink = `${adminInfo.uploadUrl}}`;
  // response console 0 = success
  obj.forEach((el) =>
    knex('TB_BBS')
      .insert(el)
      .then((response: any) => console.log(response, webLink))
  );
}
Uploader();
