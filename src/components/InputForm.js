import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';

/**
 * InputForm component for submitting text to be fact-checked
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Callback function when form is submitted
 * @returns {JSX.Element} Rendered component
 */
function InputForm({ onSubmit }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/fact-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to check facts');
      }

      const data = await response.json();
      onSubmit(data);
    } catch (error) {
      onSubmit({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4" role="form">
      <Form.Group className="mb-3">
        <Form.Label htmlFor="factCheckInput" className="fw-bold">
          Enter text to fact-check:
        </Form.Label>
        <Form.Control
          type="text"
          id="factCheckInput"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your text here..."
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
        disabled={!input.trim() || isLoading}
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