const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
// socket expexts to be called raw http server
// this logic - server supports the web sockets
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// 'socket'object holds the information about the new connection
io.on("connection", (socket) => {
  console.log("Socket connected");

  // "welcome" to perticular user
  socket.emit("message", "Welcome");

  // emit to everybody but that perticular user
  socket.broadcast.emit("message", "A new user has joined!");
  socket.on("sendMessage", (message) => {
    // send it to everyone
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user has left!");
  });

  socket.on("sendLocation", (coords) => {
    io.emit(
      "message",
      `https://google.com/maps?q=${coords.lat},${coords.long}`
    );
  });

  //  server (emit) -> client recieved - countUppdated
  // client (emit) -> server recieved - increment

  // socket.emit("countUpdated", count);

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
