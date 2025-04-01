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
const OpenAI = require('openai');

/**
 * Express application instance.
 * Configured with CORS middleware and JSON body parsing.
 * @type {express.Application}
 */
const app = express();
const port = process.env.PORT || 3001;

// Log environment variables (without sensitive data)
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', port);
console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);

/**
 * CORS configuration options based on environment
 * @type {Object}
 */
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://www.truthcheck.me', 'https://truthcheck.me', 'https://truthcheck-me.vercel.app'] 
    : 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: false,
  optionsSuccessStatus: 204
};

/**
 * Middleware Configuration
 * - CORS: Enables cross-origin requests with environment-specific configuration
 * - JSON: Parses JSON request bodies
 */
app.use(cors(corsOptions));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

/**
 * Initialize OpenAI client with error handling
 */
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('OpenAI client initialized successfully');
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  process.exit(1);
}

/**
 * Health check endpoint.
 * @route GET /health
 * @returns {Object} Response object with status and timestamp
 * @returns {string} Response.status - Status of the server
 * @returns {string} Response.timestamp - Timestamp of the request
 */
app.get('/health', (req, res) => {
  try {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
    console.log('Received fact-check request for text:', text.substring(0, 50) + '...');

    if (!text || typeof text !== 'string') {
      console.error('Invalid text input:', text);
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a fact-checking assistant. Analyze the given text and provide a response in the following format:\n\nGrade: [Absolutely False, Mostly False, Neutral, Mostly True, or Truth]\nReasoning: [Your detailed analysis]\nSources: [List of links to sources or references.]"
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 400
    });

    console.log('OpenAI response received');
    const response = completion.choices[0].message.content;
    console.log('Raw OpenAI response:', response);

    // Parse the response into structured data
    const lines = response.split('\n').filter(line => line.trim());
    let grade = '', reasoning = '', sources = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.toLowerCase().startsWith('grade:')) {
        grade = trimmedLine.replace(/^grade:\s*/i, '').trim();
      } else if (trimmedLine.toLowerCase().startsWith('reasoning:')) {
        reasoning = trimmedLine.replace(/^reasoning:\s*/i, '').trim();
      } else if (trimmedLine.toLowerCase().startsWith('sources:')) {
        // Get all lines after "Sources:" until we hit another section or end
        const sourceLines = [];
        let i = lines.indexOf(line) + 1;
        while (i < lines.length && 
               !lines[i].toLowerCase().startsWith('grade:') && 
               !lines[i].toLowerCase().startsWith('reasoning:')) {
          const sourceLine = lines[i].trim();
          if (sourceLine) {
            // Remove numbering if present (e.g., "1. ", "2. ")
            sourceLines.push(sourceLine.replace(/^\d+\.\s*/, ''));
          }
          i++;
        }
        sources = sourceLines.join(', ');
      }
    }

    console.log('Parsed response:', { grade, reasoning, sources });

    // Validate the response
    if (!grade) {
      console.error('Missing grade in response');
      throw new Error('Invalid response format: Missing grade');
    }
    if (!reasoning) {
      console.error('Missing reasoning in response');
      throw new Error('Invalid response format: Missing reasoning');
    }

    // If no sources provided, use a default message
    if (!sources) {
      console.log('No sources provided, using default message');
      sources = 'No sources found. Answer based on general knowledge.';
    }

    res.json({ grade, reasoning, sources });
  } catch (error) {
    console.error('Fact-check error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fact-check text',
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
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

/**
 * Server Startup
 * Only starts the server if this file is run directly (not imported as a module).
 * Uses PORT from environment variables or defaults to 3001.
 */
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }).on('error', (error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

/**
 * Module Exports
 * Exports the Express app instance for testing purposes.
 * This allows the app to be imported and tested without starting the server.
 * @type {express.Application}
 */
module.exports = app;