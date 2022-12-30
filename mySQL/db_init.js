const mysql = require("mysql2");

const db = mysql
  .createPool({
    host: process.env.MYQSL_HOST,
    user: process.env.MYQSL_USER_NAME,
    password: process.env.MYSQL_USER_PASSWORD,
    database: process.env.MYQSL_DATABASE_NAME,
  })
  .promise();

module.exports = db;
