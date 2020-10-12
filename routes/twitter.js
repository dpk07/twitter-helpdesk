const express = require("express");
const router = express.Router();
const request = require("request");
const keys = require("../config/keys");
const streams = new Map();
const Twit = require("twit");
router.route("/reverse").post(function (req, res) {
  request.post(
    {
      url: "https://api.twitter.com/oauth/request_token",
      oauth: {
        oauth_callback: "http%3A%2F%2Flocalhost%3A5000%2Ftwitter-callback",
        consumer_key: process.env.consumerKey || keys.consumerKey,
        consumer_secret: process.env.consumerKey || keys.consumerSecret,
      },
    },
    function (err, r, body) {
      if (err) {
        return res.send(500, { message: err.message });
      }
      var jsonStr =
        '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
      res.send(JSON.parse(jsonStr));
    }
  );
});

router.route("/").post((req, res) => {
  request.post(
    {
      url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
      oauth: {
        consumer_key: process.env.consumerKey || keys.consumerKey,
        consumer_secret: process.env.consumerKey || keys.consumerSecret,
        token: req.query.oauth_token,
      },
      form: { oauth_verifier: req.query.oauth_verifier },
    },
    function (err, r, body) {
      if (err) {
        return res.send(500, { message: err.message });
      }

      const bodyString =
        '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
      const parsedBody = JSON.parse(bodyString);

      req.body["oauth_token"] = parsedBody.oauth_token;
      req.body["oauth_token_secret"] = parsedBody.oauth_token_secret;
      req.body["user_id"] = parsedBody.user_id;
      const screenName = parsedBody.screen_name;
      if (!streams.has(screenName)) {
        const stream = setupStream(parsedBody, screenName, res.io);
        streams.set(screenName, stream);
      }
      res.json(parsedBody);
    }
  );
});

router.route("/reply").post((req, res) => {
  const oauth_token = req.body["oauth_token"];
  const oauth_token_secret = req.body["oauth_token_secret"];
  const screen_name = req.body["screen_name"];
  const tweet = req.body["tweet"];
  const T = new Twit({
    consumer_key: process.env.consumerKey || keys.consumerKey,
    consumer_secret: process.env.consumerKey || keys.consumerSecret,
    access_token: oauth_token,
    access_token_secret: oauth_token_secret,
    timeout_ms: 60 * 1000,
    strictSSL: true,
  });
  T.post("statuses/update", tweet, function (err, data, response) {
    console.log(data);
    res.io.to(screen_name).emit("tweet", data);
    res.sendStatus(200);
  });
});

router.route("/getRecentMentions").post((req, res) => {
  const oauth_token = req.body["oauth_token"];
  const oauth_token_secret = req.body["oauth_token_secret"];
  const T = new Twit({
    consumer_key: keys.consumerKey,
    consumer_secret: keys.consumerSecret,
    access_token: oauth_token,
    access_token_secret: oauth_token_secret,
    timeout_ms: 60 * 1000,
    strictSSL: true,
  });
  T.get("statuses/mentions_timeline", function (err, data, response) {
    console.log(data);
    res.json(data);
  });
});

module.exports = router;

function setupStream(parsedBody, screenName, io) {
  const T = new Twit({
    consumer_key: keys.consumerKey,
    consumer_secret: keys.consumerSecret,
    access_token: parsedBody.oauth_token,
    access_token_secret: parsedBody.oauth_token_secret,
    timeout_ms: 60 * 1000,
    strictSSL: true,
  });

  const stream = T.stream("statuses/filter", { track: [`@${screenName}`] });

  stream.on("tweet", function (tweet) {
    console.log(tweet);
    io.to(screenName).emit("tweet", tweet);
  });
  return stream;
}
