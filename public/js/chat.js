const socket = io();

socket.on("message", (message) => {
  console.log(message);
});

document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const message = e.target.elements.message.value;
  // also can be done by "document.querySelector("input").value;"
  socket.emit("sendMessage", message);
});

document.querySelector("#send-location").addEventListener("click", (e) => {
  e.preventDefault();
  if (!navigator.geolocation) {
    return alert("Geo location is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit("sendLocation", {
      lat: position.coords.latitude,
      long: position.coords.longitude,
    });
  });
});

// socket.on("countUpdated", (count) => {
//   console.log("Count has been updated ", count);
// });

// document.querySelector("#increment").addEventListener("click", (count) => {
//   console.log("Clicked");
//   socket.emit("increment");
// });
