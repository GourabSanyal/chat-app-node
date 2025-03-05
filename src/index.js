const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
require('dotenv').config();
// const FRONTEND_URL = process.env.FRONTEND_URL;
// const BACKEND_URL = process.env.BACKEND_URL;
const cors = require('cors')
const hbs = require('hbs');
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

// dev or prod ?
const isDevelopment = process.env.NODE_ENV !== 'production';
const BACKEND_URL = isDevelopment 
  ? process.env.LOCAL_BACKEND_URL 
  : process.env.PROD_BACKEND_URL;
const FRONTEND_URL = isDevelopment 
  ? process.env.LOCAL_FRONTEND_URL 
  : process.env.PROD_FRONTEND_URL;

const app = express();
const server = http.createServer(app);

// socket expexts to be called raw http server
// this logic - server supports the web sockets
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));
app.use(cors());



const io = socketio(server,{
  cors : {
    origin: [
      process.env.LOCAL_FRONTEND_URL,
      process.env.PROD_FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3000;

console.log("BACKEND_URL fromm index js:", BACKEND_URL);
console.log("FRONTEND_URL fromm index js:", FRONTEND_URL);

app.get('/env-config.js', (req, res) => {
  console.log("env config hit");
  res.type('application/javascript');
  res.send(`
    window.BACKEND_URL = "${BACKEND_URL}";
    window.FRONTEND_URL = "${FRONTEND_URL}";
    window.ENV = "${isDevelopment ? 'development' : 'production'}";
  `);
  // res.send(`window.BACKEND_URL = "${BACKEND_URL}";`);
});

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
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
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
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
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
