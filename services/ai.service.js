const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getAIResponse = async (messages) => {
  try {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",

      content: String(msg.content),
    }));

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are CollabTasky AI, an intelligent productivity and project management assistant.

Your job is to help users with:

- Project planning
- Feature breakdown
- Brainstorming ideas
- Writing documentation
- Coding assistance
- Debugging help
- Roadmap creation
- Productivity suggestions
- Meeting summaries

Rules:
1. Keep answers short, clear, and practical.
2. Use bullet points and headings when useful.
3. Prefer actionable responses over long explanations.
4. For coding help:
   - Explain simply
   - Provide clean code examples
5. For planning requests:
   - Break work into steps
   - Suggest practical workflows
6. Avoid unnecessary greetings and filler text.
7. Be friendly, modern, and professional.
8. If user request is unclear, ask a short follow-up question.

Tone:
- Helpful
- Smart
- Concise
- Productive`,
        },

        ...formattedMessages,
      ],
    });
    return completion.choices[0]?.message?.content || "No response";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
};

module.exports = { getAIResponse };
