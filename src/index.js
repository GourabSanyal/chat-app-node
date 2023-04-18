const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
// socket expexts to be called raw http server
// this logic - server supports the web sockets
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// 'socket'object holds the information about the new connection

// socket.on(event, function, arg)

io.on("connection", (socket) => {
  console.log("Socket connected");

  socket.on("join", ({ username, room }) => {
    socket.join(room);

    socket.emit("message", generateMessage("Welcome!")); // --> "welcome" to perticular user
    socket.broadcast
      .to(room)
      .emit("message", generateMessage(`${username} has joined`)); // --> emit to everybody, but that perticular user
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter(message);

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    io.to("ab").emit("message", generateMessage(message)); // --> send it to everyone
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    io.emit(
      "locationMessage",
      generateLocationMessage(
        `https://google.com/maps?q=${coords.lat},${coords.long}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left!"));
  });

  //  server (emit) -> client recieved - countUppdated
  // client (emit) -> server recieved - increment

  // socket.emit("countUpdated", count); --> put it inside "io.on" to work"

  // socket.on("increment", () => {
  //   count++;
  //   // this will update the value to one client
  //   // socket.emit("countUpdated", count);

  //   // this will update the value in all the clients
  //   io.emit("countUpdated", count);
  // });
});

server.listen(port, () => {
  console.log("Server is runnign on port " + port);
});
