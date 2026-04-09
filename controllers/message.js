const Message = require("../models/message");

// Get Project Messages

const getProjectMessages = async (req, res) => {
  try {
    const messages = await Message.find({ projectId: req.params.projectId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in fetching project messages", error });
  }
};
//  Get Conversation Messages (DM)
const getConversationMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching DM messages" });
  }
};
module.exports = {
  getProjectMessages,
  getConversationMessages,
};
