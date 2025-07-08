const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function getChatResponse(userQuery) {
    try {
        // Get the model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = "You are a helpful medical chatbot assistant. Provide informative and helpful responses about health and medical topics. Always recommend consulting with healthcare professionals for serious medical concerns.";
        
        const prompt = `${systemPrompt}\n\nUser: ${userQuery}\n\nAssistant:`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text();

        return aiResponse;

    } catch (error) {
        console.error("Error getting chat response:", error);
        throw new Error("Failed to get chat response");
    }
}



module.exports = {
    getChatResponse
};