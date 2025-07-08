const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config({path: '../.env'});


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Function to get chat response from Google Generative AI
async function getChatResponse(userQuery) {
    try {
        // Get the model - using the correct model name
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create system prompt for medical questions and greetings only
        const systemPrompt = `You are a specialized medical chatbot assistant. You should ONLY respond to:

1. MEDICAL QUESTIONS: Provide informative and helpful responses about health and medical topics
   - Always recommend consulting with healthcare professionals for serious medical concerns
   - Include disclaimers when appropriate that you're not a replacement for professional medical advice
   - Be empathetic and understanding when discussing health issues

2. GREETINGS & POLITE CONVERSATIONS: Respond warmly to greetings and basic conversational exchanges
   - Examples: "Hello", "Hi", "Good morning", "How are you?", "Thank you", "Goodbye", etc.
   - Keep responses brief and friendly
   - Guide conversation toward medical topics

For ANY OTHER QUESTIONS (technology, science, general knowledge, entertainment, etc.):
- Politely decline to answer
- Redirect the user to ask medical questions instead
- Example response: "I'm sorry, but I'm specifically designed to help with medical and health-related questions. Please feel free to ask me anything about your health or medical concerns."

Always maintain a professional, helpful, and caring tone.`;
        
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