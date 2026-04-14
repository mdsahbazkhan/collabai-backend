let io;

const initSocket = (server) => {
  const { Server } = require("socket.io");
  const Message = require("../models/message");

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ✅ Join Room
    socket.on("joinRoom", (roomId) => {
      if (!roomId) return;
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // ✅ Typing Start
    socket.on("typing", ({ roomId, user }) => {
      if (!roomId || !user) return;

      socket.to(roomId).emit("typing", { user });
    });

    // ✅ Typing Stop
    socket.on("stopTyping", ({ roomId, user }) => {
      if (!roomId) return;

      socket.to(roomId).emit("stopTyping", { user });
    });

    // ✅ Send Message
    socket.on("sendMessage", async (data) => {
      try {
        const { sender, text, projectId, conversationId, roomId } = data;

        if (!text?.trim()) return;

        const message = new Message({
          sender,
          text,
          projectId: projectId || null,
          conversationId: conversationId || null,
        });

        await message.save();
        await message.populate("sender", "name avatar");

        io.to(roomId).emit("newMessage", message);

      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // ✅ Disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };