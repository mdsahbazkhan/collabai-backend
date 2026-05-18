const { getAIResponse } = require("../services/ai.service");

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
module.exports = { chatWithAI };
