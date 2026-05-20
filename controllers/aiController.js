const {
  getAIResponse,
  handleProjectAIChat,
} = require("../services/ai.service");

const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const aiResponse = await getAIResponse(messages);

    res.status(200).json({
      success: true,
      data: aiResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "AI error",
    });
  }
};

// New controller for project-specific AI chat

const projectAIChat = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message, messages } = req.body;
    const userId = req.user.id;

    const aiReeponse = await handleProjectAIChat(
      projectId,
      userId,
      message,
      messages,
    );

    res.status(200).json(aiReeponse);
  } catch (error) {
    console.log("PROJECT AI ERROR:", error);
    res.status(500).json({ message: "AI request failed" });
  }
};

module.exports = { chatWithAI, projectAIChat };
