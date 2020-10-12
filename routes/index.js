var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render(__dirname + "/../public/index.html");
});
router.get("/list", function (req, res, next) {
  res.sendFile(__dirname + "/../public/index.html");
});

module.exports = router;
