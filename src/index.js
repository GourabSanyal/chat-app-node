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

// app.get("/", (req, res) => {
//   res.sendFile(path.join(publicDirectoryPath, "index.html"));
// });

let count = 0;

//  server (emit) -> client recieved - countUppdated
// client (emit) -> server recieved - increment

// 'socket'object holds the information about the new connection
io.on("connection", (socket) => {
  console.log("New socket connection");

  socket.emit("countUpdated", count);

  socket.on("increment", () => {
    count++;
    // this will update the value to one client
    // socket.emit("countUpdated", count);

    // this will update the value in all the clients
    io.emit("countUpdated", count);
  });
});

server.listen(port, () => {
  console.log("Server is runnign on port " + port);
});
