const process_single_url = require("../module/process_single_url.js");

function main(bot, db) {
  bot.on("text", (ctx) => {
    const url = ctx.message.text;
    if (url.includes("playlist?")) return ctx.reply("playlits");
    process_single_url(bot, db, ctx, url);
  });
}

module.exports = main;
