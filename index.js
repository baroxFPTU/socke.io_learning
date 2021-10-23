const express = require("express");
const app = express();

const server = require("http").Server(app);
const io = require("socket.io")(server);

let view = 0;

const messages = [];

io.on("connection", function (socket) {
  //set username from client
  socket.on("client-send-name", function (name) {
    socket.username = name || Math.floor(Math.random() * (100 - 1) + 1);
    console.log("client " + socket.username);

    if (messages.length !== 0) {
      socket.emit("server-update-message", messages);
      console.log(messages);
    }

    socket.broadcast.emit("server-update-users", socket.username);
  });

  //Catch messages from users
  socket.on("client-send-message", function (msg) {
    console.log("client " + socket.username + " send " + msg);

    messages.push({
      username: socket.username,
      message: msg,
    });
    console.log(messages);
    io.sockets.emit("server-update-messages", {
      username: socket.username,
      message: msg,
    });
  });

  socket.on("disconnect", function () {
    console.log(`User ${socket.username || socket.id} disconnected`);
    socket.broadcast.emit("server-send-users-disconnected", socket.username);
  });
});

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("./public"));

app.get("/", function (req, res) {
  res.render("home");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT);
