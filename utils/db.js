const Pool = require("pg").Pool;
require("dotenv").config();
const { aes256gcm } = require('../authorization/secret');
const cipher = aes256gcm(Buffer.alloc(32)); 

const pool = new Pool({
  user: cipher.decrypt(process.env.USER_NAME),
  password: cipher.decrypt(process.env.PASSWORD),
  host: cipher.decrypt(process.env.HOST),
  port: process.env.DB_PORT,
  database: cipher.decrypt(process.env.DATABASE),
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
