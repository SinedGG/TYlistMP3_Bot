const axios = require("axios");

const next = require("./for_single_audio.js");

function main(bot, db, ctx, url) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.get(
        `https://api.song.link/v1-alpha.1/links?url=${url}`
      );

      if (data.linksByPlatform.hasOwnProperty("youtubeMusic")) {
        var info;
        const song_id =
          data.entitiesByUniqueId[
            `${data.linksByPlatform.youtubeMusic.entityUniqueId}`
          ].id;
        if (data.linksByPlatform.hasOwnProperty("itunes")) {
          var id = data.linksByPlatform.itunes.entityUniqueId;
          info = parse(data, id);
        } else if (data.linksByPlatform.hasOwnProperty("spotify")) {
          var id = data.linksByPlatform.spotify.entityUniqueId;
          info = parse(data, id);
        } else {
          var id = data.linksByPlatform.youtubeMusic.entityUniqueId;
          info = parse(data, id);
          info.thumbnail = `https://i.ytimg.com/vi_webp/${song_id}/maxresdefault.webp`;
        }
        info.id = song_id;
        await next(bot, db, ctx, info);
        resolve();
      } else {
        ctx.reply(`Cannot get url.`);
      }
    } catch (error) {
      ctx.reply(`Error.`);
    }
  });
}

function parse(data, unique_id) {
  const song_data = data.entitiesByUniqueId[unique_id];
  const info = {
    artist: song_data.artistName,
    title: song_data.title,
    thumbnail: song_data.thumbnailUrl,
  };
  return info;
}

module.exports = main;
