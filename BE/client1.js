const { io } = require("socket.io-client");


const socket = io("http://localhost:8080");

socket.on("connect", () => {
  console.log("✅ Client 1 connected:", socket.id);
  socket.emit("user_online", "68fe3bb9bba6b81e1a23f2cf"); // recruiterId
  const conversationId = "6916d3c533e23005305d8354";
  socket.emit("join_conversation", conversationId);

  // Test typing
  setTimeout(() => {
    socket.emit("typing", { conversationId, userId: "68fe3bb9bba6b81e1a23f2cf" });
  }, 2000);

  setTimeout(() => {
    socket.emit("stop_typing", { conversationId, userId: "68fe3bb9bba6b81e1a23f2cf" });
  }, 4000);

  // Test gửi tin nhắn
  setTimeout(() => {
    socket.emit("send_message", {
      conversationId,
      senderId: "68fe3bb9bba6b81e1a23f2cf",
      content: "Xin chào! Tôi thấy CV của bạn rất phù hợp!"
    });
  }, 6000);
});

socket.on("receive_message", (msg) => console.log("💬 Client 1 nhận:", msg));
socket.on("update_online_users", (list) => console.log("👥 Online users:", list));
socket.on("user_typing", (d) => console.log(`✍️ ${d.userId} đang nhập...`));
socket.on("user_stop_typing", (d) => console.log(`🛑 ${d.userId} dừng nhập`));
