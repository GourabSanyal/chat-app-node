const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

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

  // options --> { username, room }
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome!")); // --> "welcome" to perticular user
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin", `${user.username} has joined`)); // --> emit to everybody, but that perticular user
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter(message);

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    io.to(user.room).emit("message", generateMessage(user.username, message)); // --> send it to everyone
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.lat},${coords.long}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );
    }
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
