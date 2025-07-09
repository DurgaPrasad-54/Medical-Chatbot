const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config({path: '../.env'});


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
async function getChatResponse(userQuery) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const systemPrompt = `You are a medical chatbot assistant. Your main focus is medical and health-related topics, but you can give brief, basic responses to non-medical questions.

1. MEDICAL QUESTIONS:
   - Respond fully, clearly, and helpfully
   - Keep tone professional, caring, and supportive
   - Use bullet points or short sentences instead of paragraphs
   - Always recommend seeing a doctor for serious issues

2. NON-MEDICAL QUESTIONS (like tech, science, general info):
   - Give only a basic/general idea (1–2 short lines or bullet points)
   - Politely mention that you're mainly for medical assistance
   - Example: "Here’s a basic idea, but I specialize in medical help. Feel free to ask about your health."

3. POLITE CONVERSATIONS (Hi, Thanks, How are you):
   - Respond warmly and briefly
   - Guide user back to medical topics

Avoid long paragraphs. Be brief, clear, and stay focused on medical help whenever possible.`;

        // Combine system prompt with user query
        const prompt = `${systemPrompt}\n\nUser: ${userQuery}\n\nAssistant:`;

        // Generate response
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