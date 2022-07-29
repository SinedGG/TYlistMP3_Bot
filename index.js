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

const downloader = require("./module/download_audio.js");

bot.on("text", async (ctx) => {
  try {
    var url = ctx.message.text;
    if (!(url.includes("youtube.com") || url.includes("youtu.be")))
      return ctx.reply("Nope.");
    const info = await ytdl.getBasicInfo(url);
    const videoID = info.videoDetails.videoId;
    console.log(`[${videoID}] Startign task from ${ctx.chat.username} user`);
    var [rows] = await db.query(
      `select * from link where video_id = '${videoID}'`
    );
    bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
    if (rows.length > 0) {
      bot.telegram.forwardMessage(
        ctx.chat.id,
        process.env.data_chat_id,
        rows[0].message_id
      );
    } else {
      var loading = await bot.telegram.sendMessage(ctx.chat.id, "Loading...");
      var patch = await downloader(info);
      var msg = await bot.telegram.sendAudio(
        process.env.data_chat_id,
        { source: patch },
        {
          title: info.videoDetails.title,
          performer: info.videoDetails.author.name.replace(" - Topic", ""),
          thumb: { source: `./temp/${videoID}.jpg` },
        }
      );

      bot.telegram.forwardMessage(
        ctx.chat.id,
        process.env.data_chat_id,
        msg.message_id
      );
      db.query(`insert into link values ('${videoID}', '${msg.message_id}')`);
      bot.telegram.deleteMessage(ctx.chat.id, loading.message_id);
      console.log(`[${videoID}] task from complete`);
      clear(videoID, patch);
    }
  } catch (error) {
    console.log(error);
    console.log(`Err on task from ${ctx.chat.username}`);
    var nope = await bot.telegram.sendMessage(ctx.chat.id, "Nope.");
    setTimeout(() => {
      bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
      bot.telegram.deleteMessage(ctx.chat.id, nope.message_id);
    }, 15 * 1000);
  }
});

function clear(videoID, patch) {
  try {
    fs.unlinkSync(`./temp/${videoID}.jpg`);
    fs.unlinkSync(`./temp/${videoID}.webp`);
    fs.unlinkSync(patch);
  } catch (error) {
    console.log(error);
  }
}

bot.launch();
