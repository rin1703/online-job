const { io } = require("socket.io-client");

const socket = io("http://localhost:8080");

socket.on("connect", () => {
  console.log("✅ Client 2 connected:", socket.id);
  socket.emit("user_online", "68fe3bb9bba6b81e1a23f2d1"); // jobSeekerId
  const conversationId = "6916d3c533e23005305d8354";
  socket.emit("join_conversation", conversationId);
});

socket.on("receive_message", (msg) => console.log("💬 Client 2 nhận:", msg));
socket.on("update_online_users", (list) => console.log("👥 Online users:", list));
socket.on("user_typing", (d) => console.log(`✍️ ${d.userId} đang nhập...`));
socket.on("user_stop_typing", (d) => console.log(`🛑 ${d.userId} dừng nhập`));
