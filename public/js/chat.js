const socket = io();

socket.on("countUpdated", (count) => {
  console.log("Count has been updated ", count);
});

document.querySelector("#increment").addEventListener("click", (count) => {
  console.log("Clicked");
  socket.emit("increment");
});
