const socket = io();
// const Mustache = Mustache();

// Elements

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButtons = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;

const { username, room } = Object.fromEntries(
  new URLSearchParams(location.search)
);

// Get the query string from the URL
// const queryString = window.location.search;

// server (emit) -> client ( receive) -> acknowledgement --> server

// client (emit) -> server ( receive ) -> acknowledgement --> server

// socket.on("name of the event", function, arg)
// 2nd arg in the server is the 1st arg for the callback func in client

socket.on("message", (message) => {
  console.log(message);

  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (message) => {
  console.log(message);
  const html = Mustache.render(locationMessageTemplate, {
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // --- disable the form ---

  $messageFormButtons.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;
  // also can be done by "document.querySelector("input").value;"

  // last function is for event acknowledgement
  socket.emit("sendMessage", message, (error) => {
    // --- enable the form ---
    $messageFormButtons.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    // profanity is handled "error" <-- acknowledgement
    if (error) {
      return console.log(error);
    }
    console.log("message delivered - client");
  });

  socket.emit("locationMessage", (url) => {});
});

$sendLocationButton.addEventListener("click", (e) => {
  e.preventDefault();

  if (!navigator.geolocation) {
    return alert("Geo location is not supported by your browser");
  }

  // disable buttons
  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },
      () => {
        // this is executed after the "callbacl()" is called from server
        $sendLocationButton.removeAttribute("disabled");
        console.log("location shared - client");
        // enable buttons
      }
    );
  });
});

socket.emit("join", { username, room });

// socket.on("countUpdated", (count) => {
//   console.log("Count has been updated ", count);
// });

// document.querySelector("#increment").addEventListener("click", (count) => {
//   console.log("Clicked");
//   socket.emit("increment");
// });
