import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

/**
 * Mock the global fetch function to intercept API calls
 */
global.fetch = jest.fn();

describe('App Component', () => {
  /**
   * Reset all mocks before each test
   */
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock implementation for fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 'Test response' })
    });
  });

  test('renders the initial state correctly', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Truth Checker')).toBeInTheDocument();
    expect(screen.getByLabelText(/Fact check input/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check facts/i })).toBeInTheDocument();
  });

  test('renders the main heading', () => {
    render(<App />);
    const heading = screen.getByText('Truth Checker');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-center', 'mb-4');
  });

  test('renders the input form with correct label', () => {
    render(<App />);
    expect(screen.getByLabelText(/Enter text to fact-check:/i)).toBeInTheDocument();
  });

  test('renders the input field with correct attributes', () => {
    render(<App />);
    const input = screen.getByLabelText(/Fact check input/i);
    expect(input).toHaveAttribute('id', 'factCheckInput');
    expect(input).toHaveAttribute('placeholder', 'Type your text here...');
  });

  test('maintains accessibility standards', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByLabelText(/Fact check input/i)).toBeInTheDocument();
  });

  test('changes background color to dark red when grade is Absolutely False', async () => {
    render(<App />);
    const container = screen.getByRole('main');
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        grade: 'Absolutely False',
        reasoning: 'Test reasoning',
        sources: 'Test sources'
      })
    });

    await userEvent.type(screen.getByLabelText(/Fact check input/i), 'Test statement');
    await act(async () => {
      screen.getByRole('button', { name: /check facts/i }).click();
    });

    await waitFor(() => {
      expect(container).toHaveStyle({ backgroundColor: '#8B0000' });
    });
  });

  test('changes background color to light red when grade is Mostly False', async () => {
    render(<App />);
    const container = screen.getByRole('main');
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        grade: 'Mostly False',
        reasoning: 'Test reasoning',
        sources: 'Test sources'
      })
    });

    await userEvent.type(screen.getByLabelText(/Fact check input/i), 'Test statement');
    await act(async () => {
      screen.getByRole('button', { name: /check facts/i }).click();
    });

    await waitFor(() => {
      expect(container).toHaveStyle({ backgroundColor: '#FF6B6B' });
    });
  });

  test('changes background color to yellow when grade is Neutral', async () => {
    render(<App />);
    const container = screen.getByRole('main');
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        grade: 'Neutral',
        reasoning: 'Test reasoning',
        sources: 'Test sources'
      })
    });

    await userEvent.type(screen.getByLabelText(/Fact check input/i), 'Test statement');
    await act(async () => {
      screen.getByRole('button', { name: /check facts/i }).click();
    });

    await waitFor(() => {
      expect(container).toHaveStyle({ backgroundColor: '#FFD700' });
    });
  });

  test('changes background color to light green when grade is Mostly True', async () => {
    render(<App />);
    const container = screen.getByRole('main');
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        grade: 'Mostly True',
        reasoning: 'Test reasoning',
        sources: 'Test sources'
      })
    });

    await userEvent.type(screen.getByLabelText(/Fact check input/i), 'Test statement');
    await act(async () => {
      screen.getByRole('button', { name: /check facts/i }).click();
    });

    await waitFor(() => {
      expect(container).toHaveStyle({ backgroundColor: '#90EE90' });
    });
  });

  test('changes background color to full green when grade is Truth', async () => {
    render(<App />);
    const container = screen.getByRole('main');
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        grade: 'Truth',
        reasoning: 'Test reasoning',
        sources: 'Test sources'
      })
    });

    await userEvent.type(screen.getByLabelText(/Fact check input/i), 'Test statement');
    await act(async () => {
      screen.getByRole('button', { name: /check facts/i }).click();
    });

    await waitFor(() => {
      expect(container).toHaveStyle({ backgroundColor: '#32CD32' });
    });
  });

  test('maintains white background when no grade is present', async () => {
    render(<App />);
    const container = screen.getByRole('main');
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        result: 'No grade available'
      })
    });

    await userEvent.type(screen.getByLabelText(/Fact check input/i), 'Test statement');
    await act(async () => {
      screen.getByRole('button', { name: /check facts/i }).click();
    });

    await waitFor(() => {
      expect(container).toHaveStyle({ backgroundColor: '#ffffff' });
    });
  });

  describe('Layout Components', () => {
    test('renders with correct Bootstrap classes and layout structure', () => {
      render(<App />);
      
      // Check container and layout
      const container = screen.getByRole('main');
      expect(container).toHaveClass('py-5');
      expect(container).toHaveStyle({ minHeight: '100vh' });
      
      // Check responsive column classes
      const col = container.querySelector('.col-12');
      expect(col).toHaveClass('col-md-8', 'col-lg-6');
      
      // Check title
      expect(screen.getByText('Truth Checker')).toHaveClass('text-center', 'mb-4');
    });
  });

  describe('Card Components', () => {
    test('renders structured response in a styled Card', async () => {
      const mockResponse = {
        grade: 'Truth',
        reasoning: 'Test reasoning',
        sources: 'Test sources'
      };

      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })
      );

      render(<App />);
      
      // Fill and submit the form
      const input = screen.getByRole('textbox', { name: /fact check input/i });
      const submitButton = screen.getByRole('button', { name: /check facts/i });
      
      await userEvent.type(input, 'Test input');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Wait for the card to appear
      await waitFor(() => {
        const card = screen.getByRole('region', { name: /fact check result/i });
        expect(card).toBeInTheDocument();
        expect(card).toHaveClass('shadow-sm');
        
        // Check card header
        const header = card.querySelector('.card-header');
        expect(header).toHaveClass('bg-primary', 'text-white');
        expect(header).toHaveTextContent('Fact Check Result');
        
        // Check card body content
        const body = card.querySelector('.card-body');
        expect(body).toHaveTextContent(`Grade: ${mockResponse.grade}`);
        expect(body).toHaveTextContent(`Reasoning: ${mockResponse.reasoning}`);
        expect(body).toHaveTextContent(`Sources: ${mockResponse.sources}`);
      });
    });

    test('renders error message in Alert component', async () => {
      const errorMessage = 'Failed to check facts';
      global.fetch.mockImplementationOnce(() => 
        Promise.reject(new Error(errorMessage))
      );

      render(<App />);
      
      // Fill and submit the form
      const input = screen.getByRole('textbox', { name: /fact check input/i });
      const submitButton = screen.getByRole('button', { name: /check facts/i });
      
      await userEvent.type(input, 'Test input');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Wait for the error alert to appear
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveClass('alert-danger');
        expect(alert).toHaveTextContent('Error');
        expect(alert).toHaveTextContent(errorMessage);
      });
    });
  });

  describe('Background Color Changes', () => {
    test('changes background color based on grade value', async () => {
      const mockResponse = { grade: 'Truth' };
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })
      );

      render(<App />);
      const container = screen.getByRole('main');
      
      // Initial state
      expect(container).toHaveStyle({ backgroundColor: '#ffffff' });
      
      // Fill and submit the form
      const input = screen.getByRole('textbox', { name: /fact check input/i });
      const submitButton = screen.getByRole('button', { name: /check facts/i });
      
      await userEvent.type(input, 'Test input');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Wait for background color to change
      await waitFor(() => {
        expect(container).toHaveStyle({ backgroundColor: '#32CD32' });
      });
    });

    test('maintains white background when no grade is present', async () => {
      const mockResponse = { result: 'No grade available' };
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })
      );

      render(<App />);
      const container = screen.getByRole('main');
      
      // Fill and submit the form
      const input = screen.getByRole('textbox', { name: /fact check input/i });
      const submitButton = screen.getByRole('button', { name: /check facts/i });
      
      await userEvent.type(input, 'Test input');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Wait and verify background color remains white
      await waitFor(() => {
        expect(container).toHaveStyle({ backgroundColor: '#ffffff' });
      });
    });
  });
});