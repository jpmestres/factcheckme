/**
 * @fileoverview Unit tests for the Express server using Jest and Supertest.
 * This file contains comprehensive tests for all server endpoints, including
 * health checks, fact-checking functionality, error handling, and CORS configuration.
 * It uses Jest's mocking capabilities to simulate OpenAI API responses and errors.
 */

const request = require('supertest');
const OpenAI = require('openai');

/**
 * Mock OpenAI module to prevent actual API calls during testing.
 * This ensures tests are fast, reliable, and don't incur API costs.
 */
// Mock OpenAI before importing server
jest.mock('openai');

/**
 * Mock response structure that simulates a successful OpenAI API response.
 * @type {Object}
 */
// Create a mock implementation that will be used by default
const mockOpenAIResponse = {
  choices: [{
    message: {
      content: 'This is a test fact-check response.'
    }
  }]
};

/**
 * Mock function for successful OpenAI API calls.
 * @type {jest.Mock}
 */
const mockCreate = jest.fn().mockResolvedValue(mockOpenAIResponse);

/**
 * Set up the default mock implementation for OpenAI.
 * This implementation will be used by default unless overridden in specific tests.
 */
// Set up the default mock implementation
OpenAI.mockImplementation(() => ({
  chat: {
    completions: {
      create: mockCreate
    }
  }
}));

/**
 * Import the Express app after mocking is set up.
 * This ensures the app uses our mocked OpenAI implementation.
 */
// Now import the server after mocking is set up
const app = require('../server');

/**
 * Main test suite for the Express server.
 * Tests are organized by endpoint and functionality.
 */
describe('Express Server', () => {
  /**
   * Reset all mocks before each test to ensure clean state.
   * Also resets the OpenAI mock implementation to default.
   */
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation to the default
    OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }));
  });

  /**
   * Test suite for the health check endpoint.
   * Verifies that the server responds correctly to health check requests.
   */
  describe('Health Check Endpoint', () => {
    /**
     * Verifies that the health check endpoint returns a 200 status code.
     */
    it('returns 200 status code', async () => {
      const response = await request(app).get('/api/health');
      expect(response.statusCode).toBe(200);
    });

    /**
     * Verifies that the health check endpoint returns the correct JSON response.
     */
    it('returns correct JSON response', async () => {
      const response = await request(app).get('/api/health');
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  /**
   * Test suite for the fact-checking endpoint.
   * Tests both successful and error cases for the OpenAI API integration.
   */
  describe('Fact-Checking Endpoint', () => {
    /**
     * Test suite for valid input cases.
     * Verifies successful fact-checking requests and OpenAI API integration.
     */
    describe('Valid Input', () => {
      /**
       * Verifies that valid text input returns a 200 status code.
       */
      it('returns 200 status code for valid text input', async () => {
        const response = await request(app)
          .post('/api/fact-check')
          .send({ text: 'Test statement' })
          .set('Content-Type', 'application/json');
        
        expect(response.statusCode).toBe(200);
      });

      /**
       * Verifies that the response contains a result property with string content.
       */
      it('returns JSON response with result property', async () => {
        const response = await request(app)
          .post('/api/fact-check')
          .send({ text: 'Test statement' })
          .set('Content-Type', 'application/json');
        
        expect(response.body).toHaveProperty('result');
        expect(typeof response.body.result).toBe('string');
      });

      /**
       * Verifies that the OpenAI API is called with correct parameters.
       * Checks model, temperature, max_tokens, and message structure.
       */
      it('calls OpenAI API with correct parameters', async () => {
        const testText = 'Test statement';
        await request(app)
          .post('/api/fact-check')
          .send({ text: testText })
          .set('Content-Type', 'application/json');

        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            model: 'gpt-4-turbo-preview',
            temperature: 0.7,
            max_tokens: 500,
            messages: expect.arrayContaining([
              expect.objectContaining({
                role: 'system',
                content: expect.stringContaining('fact-checking assistant')
              }),
              expect.objectContaining({
                role: 'user',
                content: expect.stringContaining(testText)
              })
            ])
          })
        );
      });
    });

    /**
     * Test suite for invalid input cases.
     * Verifies proper error handling for missing or empty text.
     */
    describe('Invalid Input', () => {
      /**
       * Verifies that missing text returns a 400 status code.
       */
      it('returns 400 when no text is provided', async () => {
        const response = await request(app)
          .post('/api/fact-check')
          .send({})
          .set('Content-Type', 'application/json');
        
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Text is required');
      });

      /**
       * Verifies that empty text returns a 400 status code.
       */
      it('returns 400 when text is empty string', async () => {
        const response = await request(app)
          .post('/api/fact-check')
          .send({ text: '' })
          .set('Content-Type', 'application/json');
        
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Text is required');
      });
    });

    /**
     * Test suite for OpenAI API error cases.
     * Verifies proper error handling when the OpenAI API fails.
     */
    describe('OpenAI API Errors', () => {
      /**
       * Verifies that OpenAI API errors return a 500 status code.
       * Checks error response structure and mock function calls.
       */
      it('returns 500 when OpenAI API fails', async () => {
        mockCreate.mockRejectedValueOnce(new Error('API Error'));
        
        const response = await request(app)
          .post('/api/fact-check')
          .send({ text: 'Test statement' })
          .set('Content-Type', 'application/json');
        
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty('error', 'Failed to process fact-checking request');
        expect(response.body).toHaveProperty('details');
        expect(mockCreate).toHaveBeenCalled();
      });
    });
  });

  /**
   * Test suite for 404 error handling.
   * Verifies that undefined routes return appropriate 404 responses.
   */
  describe('404 Error Handling', () => {
    /**
     * Verifies that non-existent routes return a 404 status code.
     */
    it('returns 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/nonexistent');
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not Found');
    });

    /**
     * Verifies that invalid HTTP methods return a 404 status code.
     */
    it('returns 404 for invalid HTTP methods', async () => {
      const response = await request(app)
        .put('/api/health')
        .set('Content-Type', 'application/json');
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });

  /**
   * Test suite for CORS configuration.
   * Verifies that the server properly handles cross-origin requests.
   */
  describe('CORS Configuration', () => {
    /**
     * Verifies that CORS headers are properly set for cross-origin requests.
     */
    it('allows requests from any origin', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000');
      
      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });
});