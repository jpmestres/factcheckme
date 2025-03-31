import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';

/**
 * InputForm component for submitting text to be fact-checked
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Callback function when form is submitted
 * @returns {JSX.Element} Rendered component
 */
function InputForm({ onSubmit }) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      // First check if the server is up
      const healthCheck = await fetch(`${process.env.REACT_APP_API_URL}/health`);
      if (!healthCheck.ok) {
        throw new Error('Server is not responding');
      }
      const healthData = await healthCheck.json();
      console.log('Server health:', healthData);

      // Then send the fact-check request
      console.log('Sending request to:', `${process.env.REACT_APP_API_URL}/api/fact-check`);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/fact-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to check facts: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      onSubmit(data);
    } catch (error) {
      console.error('Error details:', error);
      onSubmit({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4" role="form">
      <Form.Group className="mb-3">
        <Form.Label htmlFor="fact-check-input" className="fw-bold">
          Enter a statement to fact check:
        </Form.Label>
        <Form.Control
          type="text"
          id="fact-check-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your statement here..."
          aria-label="Fact check input"
          className="form-control-lg shadow-sm"
          disabled={isLoading}
        />
      </Form.Group>
      <Button 
        type="submit" 
        variant="primary" 
        size="lg" 
        className="w-100 shadow-sm"
        disabled={!text.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Checking...
          </>
        ) : (
          <>
            <i className="fas fa-search me-2"></i>
            Check Facts
          </>
        )}
      </Button>
    </Form>
  );
}

export default InputForm; 