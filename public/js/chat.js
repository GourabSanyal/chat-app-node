// const BACKEND_URL = window.BACKEND_URL;
// const FRONTEND_URL = window.FRONTEND_URL;
// const ENV = window.ENV;

let BACKEND_URL = '';
let FRONTEND_URL = '';
let ENV = 'production';
let socket;

console.log(`Running in ${ENV} environment`);
console.log("Backend URL chat js:", BACKEND_URL);

// const socket = io(`${BACKEND_URL}`,{
//   transports: ['websocket', 'polling']
// });


// // More robust socket initialization
// try {
//   // Ensure URL has proper format with protocol
//   let socketUrl = BACKEND_URL;
//   if (!socketUrl.startsWith('http://') && !socketUrl.startsWith('https://')) {
//     socketUrl = 'http://' + socketUrl;
//   }
  
//   socket = io(socketUrl, {
//     transports: ['websocket', 'polling'],
//     reconnectionAttempts: 5,
//     reconnectionDelay: 1000,
//     timeout: 20000
//   });
  
//   socket.on('connect', () => {
//     console.log('Connected to server');
//   });
  
//   socket.on('connect_error', (error) => {
//     console.error('Connection error:', error);
//   });
  
//   socket.on('disconnect', (reason) => {
//     console.log('Disconnected:', reason);
//   });
// } catch (error) {
//   console.error('Socket initialization error:', error);
// }

async function initializeConfig() {
  try {
    // In development, use local values
    if (window.location.hostname === 'localhost') {
      BACKEND_URL = 'http://localhost:3000';
      FRONTEND_URL = 'http://localhost:3000';
      ENV = 'development';
      console.log(`Running in init config ${ENV} environment`);
      console.log("Backend URL:", BACKEND_URL);
      initializeSocket();
      return;
    }
    
    // In production, fetch from Netlify function
    const response = await fetch('/netlify/functions/api-config');
    if (!response.ok) {
      throw new Error(`Config fetch failed: ${response.status}`);
    }
    const config = await response.json();
    
    BACKEND_URL = config.backendUrl;
    FRONTEND_URL = config.frontendUrl;
    ENV = config.environment;
    
    console.log(`Running in 2 ${ENV} environment`);
    console.log("Backend URL:", BACKEND_URL);
    
    initializeSocket();
  } catch (error) {
    console.error('Failed to initialize config:', error);
  }
}

function initializeSocket() {
  try {
    if (BACKEND_URL && typeof BACKEND_URL === 'string') {
      // Ensure URL has proper protocol
      let socketUrl = BACKEND_URL;
      if (!socketUrl.startsWith('http://') && !socketUrl.startsWith('https://')) {
        socketUrl = 'http://' + socketUrl;
      }
      
      socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });
      
      socket.on('connect', () => {
        console.log('Connected to server');
        setupSocketEvents();
      });
      
      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
      
      socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason);
      });
    } else {
      console.error('Invalid BACKEND_URL:', BACKEND_URL);
    }
  } catch (error) {
    console.error('Socket initialization error:', error);
  }
}

function setupSocketEvents() {
  // Move all your socket event handlers here
  socket.on("message", (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
      username: message.username,
      message: message.text,
      createdAt: moment(message.createdAt).format("h:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
  });
  
  socket.on("locationMessage", (message) => {
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
      username: message.username,
      url: message.url,
      createdAt: moment(message.createdAt).format("h:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
  });
  
  socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
      room,
      users,
    });
    document.querySelector("#sidebar").innerHTML = html;
  });
}

// Initialize app
initializeConfig();


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
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Object.fromEntries(
  new URLSearchParams(location.search)
);

// Get the query string from the URL
// const queryString = window.location.search;

// server (emit) -> client ( receive) -> acknowledgement --> server

// client (emit) -> server ( receive ) -> acknowledgement --> server

// socket.on("name of the event", function, arg)
// 2nd arg in the server is the 1st arg for the callback func in client

const autoScroll = () => {
  // new message element
  const $newMessage = $messages.lastElementChild;

  // height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // height of messages container
  const containertHeight = $messages.scrollHeight;

  // how fat have I scrolled
  const scrollOffSet = $messages.scrollTop + visibleHeight;

  if (containertHeight - newMessageHeight <= scrollOffSet) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

if (socket) {
  socket.on("message", (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
      username: message.username,
      message: message.text,
      createdAt: moment(message.createdAt).format("h:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
  });
} else {
  console.error("Socket not initialized, cannot set up event handlers");
}

if (socket) {
  socket.on("locationMessage", (message) => {
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
      username: message.username,
      url: message.url,
      createdAt: moment(message.createdAt).format("h:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
  });
} else {
  console.error("Socket not initialized, cannot set up event handlers");
}

if (socket) {
  socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
      room,
      users,
    });
    document.querySelector("#sidebar").innerHTML = html;
  });
} else {
  console.error("Socket not initialized, cannot set up event handlers");
}

function safeSocketEmit(event, ...args) {
  if (socket) {
    return socket.emit(event, ...args);
  }
  console.error(`Cannot emit ${event} - socket not initialized`);
  return false;
}

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // --- disable the form ---
  $messageFormButtons.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;

  if (!socket) {
    console.error("Socket not initialized");
    $messageFormButtons.removeAttribute("disabled");
    return;
  }

  // last function is for event acknowledgement
  safeSocketEmit("sendMessage", message, (error) => {
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

  safeSocketEmit("locationMessage", (url) => {});
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

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

// function joinRoom() {
//   if (socket && username && room) {
//     socket.emit("join", { username, room }, (error) => {
//       if (error) {
//         alert(error);
//         location.href = "/";
//       }
//     });
//   } else {
//     console.error("Cannot join room - socket not initialized or missing username/room");
//   }
// }

// socket.on("countUpdated", (count) => {
//   console.log("Count has been updated ", count);
// });

// document.querySelector("#increment").addEventListener("click", (count) => {
//   console.log("Clicked");
//   socket.emit("increment");
// });
