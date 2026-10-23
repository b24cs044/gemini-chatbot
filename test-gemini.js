import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function main() {
    try {
        console.log("Sending request to Gemini...");

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: "Hello! Introduce yourself in one short sentence.",
            config: {
                thinkingConfig: {
                    thinkingLevel: "low"
                }
            }
        });

        console.log("\nGemini:");
        console.log(response.text);

    } catch (error) {
        console.error("\nGemini API Error:");
        console.error(error.message);
    }
}

main();