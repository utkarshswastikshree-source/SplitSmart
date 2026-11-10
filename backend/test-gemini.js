
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function testGemini() {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing from .env");
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        console.log("Connecting to Gemini...");

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: "Explain expense splitting in two simple sentences."
        });

        console.log("\nGemini response:");
        console.log(response.text);

    } catch (error) {
        console.error("\nGemini connection failed:");
        console.error(error.message);
    }
}

testGemini();
