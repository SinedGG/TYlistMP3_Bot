require("dotenv").config();
const { Telegraf } = require("telegraf"),
  ytdl = require("ytdl-core"),
  bot = new Telegraf(process.env.TG_TOKEN),
  fs = require("fs");
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

require("./commands/index.js")(bot, db);
require("./events/index.js")(bot, db);

bot.launch();
