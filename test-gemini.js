require("dotenv").config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function main() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: "Hello! Introduce yourself in one sentence."
        });

        console.log(response.text);
    } catch (error) {
        console.error("Gemini API Error:", error.message);
    }
}

main();