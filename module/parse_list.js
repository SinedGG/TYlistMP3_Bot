const axios = require("axios");

function main(url) {
  return new Promise(async (resolve, reject) => {
    const list_id = new URL(url).searchParams.get("list");
    const api_key = process.env.YT_KEY;
    var out = [];
    var page_token = "";

    try {
      do {
        const request = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${list_id}&pageToken=${page_token}&key=${api_key}&maxResults=1000`;
        const res = await axios.get(request);
        for (let j = 0; j < res.data.items.length; j++) {
          var id = res.data.items[j].snippet.resourceId.videoId;
          out.push("https://www.youtube.com/watch?v=" + id);
        }
        page_token = res.data.nextPageToken;
      } while (page_token && !url.includes("list=RD"));
    } catch (err) {
      reject(err);
    }
    resolve(out);
  });
}

module.exports = main;
