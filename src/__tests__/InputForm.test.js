import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputForm from '../components/InputForm';

// Mock the global fetch function
global.fetch = jest.fn();

describe('InputForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders form with correct Bootstrap classes and accessibility attributes', () => {
      render(<InputForm onSubmit={mockOnSubmit} />);
      
      // Check form elements
      expect(screen.getByRole('form')).toHaveClass('mb-4');
      expect(screen.getByLabelText('Enter text to fact-check:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /check facts/i })).toBeInTheDocument();
      
      // Check input field attributes
      const input = screen.getByRole('textbox', { name: /fact check input/i });
      expect(input).toHaveAttribute('id', 'factCheckInput');
      expect(input).toHaveAttribute('placeholder', 'Type your text here...');
      expect(input).toHaveAttribute('aria-label', 'Fact check input');
      expect(input).toHaveClass('form-control');
    });

    test('submit button is disabled when input is empty', () => {
      render(<InputForm onSubmit={mockOnSubmit} />);
      const submitButton = screen.getByRole('button', { name: /check facts/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Interaction', () => {
    test('enables submit button when input has text', async () => {
      render(<InputForm onSubmit={mockOnSubmit} />);
      const input = screen.getByRole('textbox', { name: /fact check input/i });
      const submitButton = screen.getByRole('button', { name: /check facts/i });

      await userEvent.type(input, 'Test input');
      expect(submitButton).not.toBeDisabled();
    });

    test('disables submit button when input is cleared', async () => {
      render(<InputForm onSubmit={mockOnSubmit} />);
      const input = screen.getByRole('textbox', { name: /fact check input/i });
      const submitButton = screen.getByRole('button', { name: /check facts/i });

      await userEvent.type(input, 'Test input');
      expect(submitButton).not.toBeDisabled();

      await userEvent.clear(input);
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Loading State', () => {
    test('shows loading spinner and disables controls while submitting', async () => {
      // Mock a delayed API response
      global.fetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ grade: 5 })
        }), 100))
      );

      render(<InputForm onSubmit={mockOnSubmit} />);
      const input = screen.getByRole('textbox', { name: /fact check input/i });
      const submitButton = screen.getByRole('button', { name: /check facts/i });

      // Fill and submit the form
      await userEvent.type(input, 'Test input');
      
      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Check loading state
      const spinner = screen.getByRole('status', { hidden: true });
      expect(spinner).toBeInTheDocument();
      expect(screen.getByText('Checking...')).toBeInTheDocument();
      expect(input).toBeDisabled();
      expect(submitButton).toBeDisabled();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
        expect(screen.getByText('Check Facts')).toBeInTheDocument();
        expect(input).not.toBeDisabled();
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles API errors and calls onSubmit with error message', async () => {
      const errorMessage = 'Failed to check facts';
      global.fetch.mockImplementationOnce(() => 
        Promise.reject(new Error(errorMessage))
      );

      render(<InputForm onSubmit={mockOnSubmit} />);
      const input = screen.getByRole('textbox', { name: /fact check input/i });
      const submitButton = screen.getByRole('button', { name: /check facts/i });

      await userEvent.type(input, 'Test input');
      
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ error: errorMessage });
      });
    });

    test('handles non-OK API responses', async () => {
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          status: 500
        })
      );

      render(<InputForm onSubmit={mockOnSubmit} />);
      const input = screen.getByRole('textbox', { name: /fact check input/i });
      const submitButton = screen.getByRole('button', { name: /check facts/i });

      await userEvent.type(input, 'Test input');
      
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ error: 'Failed to check facts' });
      });
    });
  });
}); 