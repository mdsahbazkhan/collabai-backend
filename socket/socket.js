let io;
const onlineUsers = new Map();
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
    socket.on("addUser", (userId) => {
      onlineUsers.set(userId, socket.id);

      // send all online users
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // ✅ Get Online Users
    socket.on("getOnlineUsers", () => {
      socket.emit("onlineUsers", Array.from(onlineUsers.keys()));
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
        const { sender, text, projectId, conversationId, roomId, receiverId } = data;

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
        // 🔥 send notification to specific user
        if (receiverId) {
          const receiverSocket = onlineUsers.get(receiverId);
          if (receiverSocket) {
            io.to(receiverSocket).emit("newNotification", {
              senderId: sender,
              conversationId,
              message,
            });
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // ✅ Mark messages as seen
    socket.on("markSeen", async ({ conversationId, userId }) => {
      if (!conversationId || !userId) return;
      try {
        await Message.updateMany(
          { conversationId, sender: { $ne: userId }, seenBy: { $ne: userId } },
          { $addToSet: { seenBy: userId } },
        );
        // Notify the other members of the conversation that messages were seen
        socket.to(conversationId).emit("messagesSeen", { conversationId, seenBy: userId });
      } catch (err) {
        console.error("markSeen error:", err);
      }
    });

    // ✅ Disconnect
    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));

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
