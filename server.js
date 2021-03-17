const express = require("express");
const path = require("path");
const http = require("http");
const app = express();
const socketio = require("socket.io");
const formatMessage = require("./helpers/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./helpers/user");
const { constants } = require("fs");

// var
const PORT = 3000 || process.env.PORT;
const server = http.createServer(app);
const io = socketio(server);

// Menerapkan static folder
app.use(express.static(path.join(__dirname, "public")));
const botName = "GabutChat";
// Dijalankan ketika client ada konek, liat documentation ingat

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.emit(
      "message",
      formatMessage(botName, "Selamat datang , Silahkan gabut disini")
    );

    // broadcast jika ada user berkoneksi, ke semua client
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage,
        (botName, `${user.username} Seseorang sudah konek ke room ini`)
      );

    // mengirim users dan room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  // menerima chatMessage dari chat
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // ketika ada client yang diskonek
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} sudah meninggalkan room ini !`)
      );
      // mengirim users dan room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
