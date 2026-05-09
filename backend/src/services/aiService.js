import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import logger from '../config/logger.js';

// Initialize Gemini API
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const geminiModel = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

// Initialize Groq API (Fallback)
const groq = process.env.GROQ_API_KEY ? new Groq({
    apiKey: process.env.GROQ_API_KEY
}) : null;

const GROQ_MODEL_NAME = "llama-3.3-70b-versatile";

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
        You are an AI assistant for a shopping app specialized in the Indian market.
        Analyze the user's message to determine if they want to search for a product price, deal, or comparison in India.
        
        If the user is asking for a product search/price/deal, respond with valid JSON:
        {
            "isSearch": true,
            "query": "extracted product name or search query"
        }
        
        If the user is just chatting (e.g., "hello", "how are you", "what can you do"), respond with valid JSON:
        {
            "isSearch": false,
            "query": null,
            "conversationalReply": "A natural, helpful response to the user's greeting or question, specialized for Indian shoppers"
        }

        Only return the JSON object, no markdown formatting.
        `;

        // 1. Try Gemini
        if (geminiModel) {
            try {
                const result = await geminiModel.generateContent({
                    contents: [{ role: "user", parts: [{ text: systemPrompt + "\nUser Message: " + message }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                    }
                });
                const response = result.response;
                const text = response.text();
                return JSON.parse(text);
            } catch (geminiError) {
                logger.warn('Gemini intent parsing failed, falling back to Groq:', geminiError.message);
            }
        }

        // 2. Fallback to Groq
        if (groq) {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                model: GROQ_MODEL_NAME,
                temperature: 0,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0]?.message?.content || "{}";
            return JSON.parse(content);
        }

        throw new Error('No AI service (Gemini or Groq) available');

    } catch (error) {
        logger.error('Error parsing intent:', error);
        // Fallback to basic regex if all AI fails
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
        You are a shopping assistant for the Indian market.
        The user asked for a product. You have been provided with search results from Indian retailers (Amazon.in, Flipkart, and Google Shopping).
        Analyze these deals and provide a helpful summary to the user in the context of the Indian market. 
        - Highlight the best price in INR (₹).
        - Mention the platforms available (Amazon.in, Flipkart, etc.).
        - If the user specified a budget, prioritize items within that budget.
        - If some items are slightly above the budget, you can mention them as "premium alternatives" or "options just outside your range" if they offer great value.
        - Keep it concise and friendly.
        - IMPORTANT: If the provided search results contain "isFallback": true, you MUST start your response with: "I'm having trouble reaching the stores live, but historically this item costs around [Best Price]."
        `;

        const userContent = `
        User Question: "${userMessage}"
        Search Results: ${JSON.stringify(searchResults.slice(0, 5))}
        `;

        // 1. Try Gemini
        if (geminiModel) {
            try {
                const result = await geminiModel.generateContent(systemPrompt + "\n" + userContent);
                return result.response.text();
            } catch (geminiError) {
                logger.warn('Gemini response generation failed, falling back to Groq:', geminiError.message);
            }
        }

        // 2. Fallback to Groq
        if (groq) {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userContent }
                ],
                model: GROQ_MODEL_NAME,
                temperature: 0.7,
            });

            return completion.choices[0]?.message?.content || "I found some deals, please check the list below!";
        }

        return "I found some deals, but my summarizer is currently offline. Please check the results below!";

    } catch (error) {
        logger.error('Error generating response:', error);
        return "I found some deals, but I'm having trouble summarizing them. Please check the results below!";
    }
};

export default {
    parseIntent,
    generateResponse
};
