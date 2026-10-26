import express from "express";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const app = express();

const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const SYSTEM_PROMPT = `
You are StudyBuddy, a helpful and friendly AI tutor.

Your goal is to help students understand concepts clearly.

Follow these guidelines:
- Explain concepts in simple and clear language.
- Give examples when they are useful.
- Break difficult topics into smaller steps.
- Encourage the student to ask questions.
- Do not unnecessarily make answers complicated.
`;

// Store conversations in server memory
const conversations = new Map();

// Maximum number of messages sent to Gemini
const MAX_HISTORY_MESSAGES = 10;

// Middleware
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Gemini Chatbot server is running!");
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    // Validate request
    if (!conversationId || !message) {
      return res.status(400).json({
        error: "conversationId and message are required."
      });
    }

    console.log(`Conversation: ${conversationId}`);
    console.log("User:", message);

    // Create conversation if it doesn't exist
    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, []);
    }

    const history = conversations.get(conversationId);

    // Add user's message to conversation history
    history.push({
      role: "user",
      parts: [
        {
          text: message
        }
      ]
    });

    // Keep only recent messages for Gemini
    const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

    console.log(
      `Sending ${recentHistory.length} messages to Gemini.`
    );

    // Send recent conversation history to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: recentHistory,
      config: {
        systemInstruction: SYSTEM_PROMPT
      }
    });

    console.log("Gemini:", response.text);

    // Add Gemini's response to full conversation history
    history.push({
      role: "model",
      parts: [
        {
          text: response.text
        }
      ]
    });

    // Send response to client
    res.json({
      reply: response.text
    });

  } catch (error) {
    console.error("Gemini API Error:", error);

    // Remove the user's message if Gemini failed
    history.pop();

    if (error.status === 503) {
      return res.status(503).json({
        error: "Gemini is temporarily unavailable due to high demand. Please try again."
      });
    }

    return res.status(500).json({
      error: "Failed to generate a response."
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});