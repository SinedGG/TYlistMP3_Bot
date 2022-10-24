const get_list = require("../module/parse_list.js");
const process_single_url = require("../module/process_single_url.js");

function main(bot, db) {
  bot.command("/list", (ctx) => {
    p(bot, db, ctx);
  });
}

async function p(bot, db, ctx) {
  const param = ctx.message.text.replace("/list ", "");
  if (!(param.includes("youtube.com") || param.includes("youtu.be")))
    return ctx.reply("Nope.");
  var list = await get_list(param);
  for (var i = 0; i < list.length; i++) {
    await process_single_url(bot, db, ctx, list[i]);
  }
}

module.exports = main;
