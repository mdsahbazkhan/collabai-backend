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
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });
    //Send Message
    socket.on("sendMessage", async (data) => {
      try {
        const { sender, text, projectId, conversationId, roomId } = data;
        const message = new Message({
          sender,
          text,
          projectId: projectId || null,
          conversationId: conversationId || null,
        });
        await message.save();
        const populatedMessage = await message.populate(
          "sender",
          "name avatar",
        );
        io.to(roomId).emit("newMessage", populatedMessage);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
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
