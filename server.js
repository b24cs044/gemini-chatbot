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

// Serves public/index.html at "/" along with style.css and script.js
app.use(express.static("public"));

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { conversationId, message } = req.body ?? {};

  // Validate request
  if (
    typeof conversationId !== "string" || !conversationId.trim() ||
    typeof message !== "string" || !message.trim()
  ) {
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

  // history is declared outside the try block so the catch block can use it
  const history = conversations.get(conversationId);
  let userMessageAdded = false;

  try {
    // Add user's message to conversation history
    history.push({
      role: "user",
      parts: [{ text: message }]
    });
    userMessageAdded = true;

    // Keep only recent messages for Gemini
    let recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

    // The slice can start on a model message. Drop it so the
    // request always begins with a user message.
    while (recentHistory.length > 1 && recentHistory[0].role !== "user") {
      recentHistory = recentHistory.slice(1);
    }

    console.log(`Sending ${recentHistory.length} messages to Gemini.`);

    // Send recent conversation history to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: recentHistory,
      config: {
        systemInstruction: SYSTEM_PROMPT
      }
    });

    const reply = response.text;

    // Gemini can return no text (for example, a blocked response)
    if (!reply) {
      history.pop();
      return res.status(502).json({
        error: "StudyBuddy could not produce a response. Please rephrase and try again."
      });
    }

    console.log("Gemini:", reply);

    // Add Gemini's response to full conversation history
    history.push({
      role: "model",
      parts: [{ text: reply }]
    });

    // Send response to client
    res.json({ reply });

  } catch (error) {
    console.error("Gemini API Error:", error);

    // Remove the user's message if Gemini failed, so history stays
    // in alternating user/model order
    if (userMessageAdded && history[history.length - 1]?.role === "user") {
      history.pop();
    }

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