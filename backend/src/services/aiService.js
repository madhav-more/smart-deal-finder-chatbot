import Groq from 'groq-sdk';
import logger from '../config/logger.js';

// Initialize Groq API
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Use a fast model for intent parsing and a better one for responses if needed
// Switching to Mixtral as Llama 3 70b (preview) was decommissioned
const MODEL_NAME = "llama-3.3-70b-versatile";

/**
 * Parsed user intent from message
 * @typedef {Object} UserIntent
 * @property {boolean} isSearch - Whether the user wants to search for a product
 * @property {string|null} query - The search query if isSearch is true
 * @property {string|null} conversationalReply - A conversational reply if isSearch is false
 */

/**
 * Analyzes the user's message to determine intent
 * @param {string} message - The user's message
 * @returns {Promise<UserIntent>}
 */
export const parseIntent = async (message) => {
    try {
        const systemPrompt = `
        You are an AI assistant for a shopping app.
        Analyze the user's message to determine if they want to search for a product price, deal, or comparison.
        
        If the user is asking for a product search/price/deal, respond with valid JSON:
        {
            "isSearch": true,
            "query": "extracted product name or search query"
        }
        
        If the user is just chatting (e.g., "hello", "how are you", "what can you do"), respond with valid JSON:
        {
            "isSearch": false,
            "query": null,
            "conversationalReply": "A natural, helpful response to the user's greeting or question"
        }

        Only return the JSON object, no markdown formatting.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: MODEL_NAME,
            temperature: 0,
            response_format: { type: "json_object" } // Enforce JSON mode
        });

        const content = completion.choices[0]?.message?.content || "{}";
        return JSON.parse(content);

    } catch (error) {
        logger.error('Error parsing intent with Groq:', error);
        // Fallback to basic regex if AI fails
        const isSearch = /price|buy|cost|deal|find/i.test(message);
        return {
            isSearch,
            query: isSearch ? message : null,
            conversationalReply: isSearch ? null : "I'm having a bit of trouble connecting to my brain right now, but I'm listening!"
        };
    }
};

/**
 * Generates a final response based on search results
 * @param {string} userMessage - The original user message
 * @param {Array} searchResults - Array of product objects found
 * @returns {Promise<string>}
 */
export const generateResponse = async (userMessage, searchResults) => {
    try {
        if (!searchResults || searchResults.length === 0) {
            return "I couldn't find any deals for that product right now. Please try being more specific or check back later.";
        }

        const systemPrompt = `
        You are a shopping assistant.
        The user asked for a product. You have been provided with search results.
        Analyze these deals and provide a helpful summary to the user. 
        - Highlight the best price.
        - Mention the platforms available.
        - Keep it concise and friendly.
        - Do not list every single technical detail, just the key info helping them decide.
        `;

        const userContent = `
        User Question: "${userMessage}"
        Search Results: ${JSON.stringify(searchResults.slice(0, 5))}
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent }
            ],
            model: MODEL_NAME,
            temperature: 0.7,
        });

        return completion.choices[0]?.message?.content || "I found some deals, please check the list below!";

    } catch (error) {
        logger.error('Error generating response with Groq:', error);
        return "I found some deals, but I'm having trouble summarizing them. Please check the results below!";
    }
};

export default {
    parseIntent,
    generateResponse
};
