var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var twitterAuthRouter = require("./routes/twitter");
const cors = require("cors");
var app = express();

// enable cors
var corsOption = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  exposedHeaders: ["x-auth-token"],
};
app.use(cors(corsOption));

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
// DB Config
const db = process.env.mongoURI || require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
//Socket IO Setup
const server = require("http").Server(app);
const io = require("socket.io")(server);
io.on("connection", (socket) => {
  const screenName = socket.handshake.query.screenName;
  //Connect the socket to only particular room.
  //The room is identified by user's screenName
  socket.join(screenName);
  console.log(" %s sockets connected", io.engine.clientsCount);
  socket.on("disconnect", function () {
    console.log("[NodeApp] (socket.io) A client has disconnected");
    socket.disconnect();
  });
});
app.use((req, res, next) => {
  res.io = io;
  next();
});
//Routes
app.get("/", function (req, res, next) {
  res.render(__dirname + "/public/index.html");
});
app.get("/list", function (req, res, next) {
  res.sendFile(__dirname + "/public/index.html");
});
app.use("/users", usersRouter);
app.use("/auth/twitter", twitterAuthRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = { app: app, server: server };
