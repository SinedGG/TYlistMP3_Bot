const ytdl = require("ytdl-core"),
  ffmpeg = require("fluent-ffmpeg"),
  fs = require("fs"),
  https = require("https"),
  sharp = require("sharp"),
  id3 = require("node-id3").Promise;

function file_name(name) {
  var out = name;
  return out.replace(/[/\\?%*:|"<>]/g, " ");
}

function main(info) {
  return new Promise(async (resolve, reject) => {
    const art =
      info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
    const title = info.videoDetails.title;
    const author = info.videoDetails.author.name.replace(" - Topic", "");
    const videoID = info.videoDetails.videoId;
    const path = `./temp/${file_name(author)} - ${file_name(title)}.mp3`;

    var stream = ytdl(info.videoDetails.video_url, {
      filter: "audioonly",
    });
    ffmpeg(stream)
      .audioBitrate(128)
      .save(path)
      .on("error", (err) => {
        console.log(err);
      })
      .on("end", () => {
        console.log(`[${videoID}] Audio download complete`);
        download_art();
      });

    function download_art() {
      https
        .get(art, (res) => {
          const file = fs.createWriteStream(`./temp/${videoID}.webp`);
          res.pipe(file);
          file.on("finish", () => {
            file.close();
            console.log(`[${videoID}] Art download complete`);
            crop_art();
          });
        })
        .on("error", (err) => {
          console.log(err);
        });
    }

    function crop_art() {
      sharp.cache(false);
      sharp(`./temp/${videoID}.webp`)
        .resize(1000, 1000)
        .toFile(`./temp/${videoID}.jpg`)
        .then(() => {
          console.log(`[${videoID}] Art cropped for`);
          set_metadata();
        });
    }

    async function set_metadata() {
      const tags = {
        title: title,
        artist: author,
        APIC: `./temp/${videoID}.jpg`,
      };
      try {
        await id3.write(tags, path);
      } catch (error) {
        console.log(err);
      }
      resolve(path);
    }
  });
}

module.exports = main;
