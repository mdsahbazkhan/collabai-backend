const { getAIResponse } = require("../services/ai.service");

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const aiResponse = await getAIResponse(message);

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
