import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  test('renders the main heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/Fact Checker/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders the input form with correct label', () => {
    render(<App />);
    const labelElement = screen.getByText(/Enter text to fact check:/i);
    expect(labelElement).toBeInTheDocument();
  });

  test('renders the input field with correct attributes', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /Fact check input/i });
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('id', 'factInput');
    expect(inputElement).toHaveAttribute('placeholder', 'Enter your text here...');
  });

  test('renders the AI response card', () => {
    render(<App />);
    const cardTitle = screen.getByText(/AI Response/i);
    const cardText = screen.getByText(/The fact-checking response will appear here.../i);
    
    expect(cardTitle).toBeInTheDocument();
    expect(cardText).toBeInTheDocument();
  });

  test('maintains accessibility standards', () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox', { name: /Fact check input/i });
    const labelElement = screen.getByText(/Enter text to fact check:/i);
    
    expect(labelElement).toHaveAttribute('for', 'factInput');
    expect(inputElement).toHaveAttribute('id', 'factInput');
  });
});
