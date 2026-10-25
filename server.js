import express from "express";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const app = express();

const PORT = 3000;

// Create Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Gemini Chatbot server is running!");
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Validate message
    if (!message) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    console.log("User:", message);

    // Send message to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: message
    });

    console.log("Gemini:", response.text);

    // Send Gemini response back to client
    res.json({
      reply: response.text
    });

  } catch (error) {
    console.error("Gemini API Error:", error);

    res.status(500).json({
      error: "Failed to generate a response."
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});