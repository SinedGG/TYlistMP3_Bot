const fs = require("fs");

const download_audio = require("./download_audio.js");

function main(bot, db, ctx, info) {
  return new Promise(async (resolve) => {
    console.log(`[${info.id}] Startign task from ${ctx.chat.username} user`);
    var [rows] = await db.query(
      `SELECT * FROM LINK WHERE video_id = '${info.id}'`
    );
    //bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
    if (rows.length > 0) {
      bot.telegram.forwardMessage(
        ctx.chat.id,
        process.env.data_chat_id,
        rows[0].message_id,
        { disable_notification: true }
      );
      setTimeout(() => {
        resolve();
      }, 250);
    } else {
      var loading = await bot.telegram.sendMessage(ctx.chat.id, "Loading...", {
        disable_notification: true,
      });
      var patch = await download_audio(info);
      var msg = await bot.telegram.sendAudio(
        process.env.data_chat_id,
        { disable_notification: true, source: patch },
        {
          title: info.title,
          performer: info.artist,
          thumb: { source: `./temp/${info.id}.jpg` },
        }
      );
      bot.telegram.forwardMessage(
        ctx.chat.id,
        process.env.data_chat_id,
        msg.message_id
      );
      db.query(`INSERT INTO LINK VALUES ('${info.id}', '${msg.message_id}')`);
      bot.telegram.deleteMessage(ctx.chat.id, loading.message_id);
      console.log(`[${info.id}] task from complete`);
      clear(info.id, patch);
      resolve();
    }
  });
}

function clear(videoID, patch) {
  try {
    fs.unlinkSync(`./temp/${videoID}.jpg`);
    fs.unlinkSync(`./temp/${videoID}.webp`);
    fs.unlinkSync(patch);
  } catch (error) {
    console.log(error);
  }
}

module.exports = main;
