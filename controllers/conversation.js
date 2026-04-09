const Conversation = require("../models/conversation");

// Create Coversation and get Conversation
const createOrGetConversation = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;
    // Check if conversation exists
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
      });
    }
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Error in conversation", error });
  }
};
module.exports = {
  createOrGetConversation,
};
