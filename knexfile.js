require("dotenv").config();

const DB_USER = process.env.DB_USER;
const DB_NAME = process.env.DB_NAME;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const DB_PASSWORD = process.env.DB_PASSWORD;

module.exports = {
  client: "postgresql",
  connection: DATABASE_URL || {
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
  },
  migrations: {
    directory: "./db/migrations",
  },
  seeds: {
    directory: "./db/seeds",
  },
};
