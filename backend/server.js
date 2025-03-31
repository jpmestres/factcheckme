/**
 * @fileoverview Express server for the fact-checking web application.
 * This server handles API requests for fact-checking functionality using OpenAI's GPT-4 API.
 * It provides endpoints for health checks and fact-checking requests, with proper error handling
 * and CORS support.
 * @module server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

/**
 * Express application instance.
 * Configured with CORS middleware and JSON body parsing.
 * @type {express.Application}
 */
const app = express();
const port = process.env.PORT || 5000;

/**
 * OpenAI client instance.
 * Initialized with API key from environment variables.
 * @type {OpenAIApi}
 */
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

/**
 * CORS configuration options based on environment
 * @type {Object}
 */
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://www.truthcheck.me', 'https://truthcheck.me']
    : 'http://localhost:3000',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

/**
 * Middleware Configuration
 * - CORS: Enables cross-origin requests with environment-specific configuration
 * - JSON: Parses JSON request bodies
 */
app.use(cors(corsOptions));
app.use(express.json());

/**
 * Health check endpoint.
 * @route GET /api/health
 * @returns {Object} Response object with status
 * @returns {string} Response.status - Status of the server
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * Fact-checking endpoint that uses OpenAI's GPT-4 API to analyze text.
 * @route POST /api/fact-check
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.text - Text to be fact-checked
 * @returns {Object} Response object with fact-checking results
 * @returns {string} Response.result - AI-generated fact-checking analysis
 * @throws {Error} 400 - If no text is provided
 * @throws {Error} 500 - If OpenAI API call fails
 */
app.post('/api/fact-check', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const prompt = `Fact-check the following statement: "${text}". Provide the response in JSON format with the following fields: "grade": (string, choose from 'Absolutely False', 'Mostly False', 'Neutral', 'Mostly True', 'Truth'), "reasoning" (string), and "sources" (array of strings).`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a fact-checking assistant. Analyze the provided text and determine if it is accurate. Provide a detailed response explaining your findings, including any potential inaccuracies or areas that need verification. You MUST respond in valid JSON format.  The 'grade' field MUST be a string."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.data.choices[0].message.content;

    try {
      // Attempt to extract JSON (robustly)
      const jsonMatch = response.match(/\{.*?\}/s);  // Find the first JSON-like object
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const aiResponse = JSON.parse(jsonString);
        return res.json(aiResponse);
      } else {
        // If no JSON is found, return the raw response
        console.warn("No JSON found in OpenAI response. Returning raw text.");
        return res.json({ result: response });
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Optionally, you might want to return a more specific error message here
      return res.status(500).json({ error: 'Failed to parse OpenAI response', details: parseError.message });
    }

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return res.status(500).json({
      error: 'Failed to process fact-checking request',
      details: error.message
    });
  }
});

/**
 * 404 Error Handler
 * Catches all undefined routes and returns a 404 status.
 * @route ALL /undefined-routes
 * @returns {Object} Response object with error message
 * @returns {string} Response.error - Error message indicating route not found
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

/**
 * Server Startup
 * Only starts the server if this file is run directly (not imported as a module).
 * Uses PORT from environment variables or defaults to 5000.
 */
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

/**
 * Module Exports
 * Exports the Express app instance for testing purposes.
 * This allows the app to be imported and tested without starting the server.
 * @type {express.Application}
 */
module.exports = app;