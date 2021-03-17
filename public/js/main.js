//membuat variable dari mengambil ID di html chat, dengan id chat-form
const chatform = document.getElementById("chat-form");
// mengambil class dari div chat messages dari chat-message ditaruh di const chatMessages
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const socket = io();

// mengambil usernaem dan room dari url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// bergabung ke chat romm
socket.emit("joinRoom", { username, room });

// get room dan users

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// message dari server
socket.on("message", (message) => {
  console.log(message);

  // memanggil fungsi outputMessage yang sudah dibuat dibawah

  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//mengambil apa yang ditulis atau di submit dari chat html

chatform.addEventListener("submit", (e) => {
  // untuk menghentikan event, biasanya event submit file , kita tidak mau itu terjadi.
  e.preventDefault();

  // e = parameter event, target elements, msg adalah id dichat html.
  const msg = e.target.elements.msg.value;

  // Mengirim message ke server.
  socket.emit("chatMessage", msg);

  //menghapus input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message ke DOM, sedikit manipulasi

function outputMessage(message) {
  // variable div, membaut element div yang baru
  const div = document.createElement("div");
  // menambahkan class message sesuai html chat
  div.classList.add("message");
  // manipulasi isi div dengan isi message
  div.innerHTML = `<p class="meta"> ${message.username}<span>${message.time}</span></p>
            <p class="text">
              ${message.text}
            </p>`;

  // menambahkan div ke class chat message di chat html.

  document.querySelector(".chat-messages").appendChild(div);
}

// Menambahkan room name ke DOM

function outputRoomName(room) {
  roomName.innerText = room;
}

// menambah user ke dom
function outputUsers(users) {
  userList.innerHTML = ` 
    ${users.map((users) => ` <li>${users.username}</li>`).join("")}
    `;
}
