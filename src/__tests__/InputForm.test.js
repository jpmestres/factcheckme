import { render, screen } from '@testing-library/react';
import InputForm from '../components/InputForm';

describe('InputForm Component', () => {
  test('renders the form with correct label', () => {
    render(<InputForm />);
    const labelElement = screen.getByText(/Enter text to fact check:/i);
    expect(labelElement).toBeInTheDocument();
  });

  test('renders the input field with correct attributes', () => {
    render(<InputForm />);
    const inputElement = screen.getByRole('textbox', { name: /Fact check input/i });
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('id', 'factInput');
    expect(inputElement).toHaveAttribute('placeholder', 'Enter your text here...');
  });

  test('renders the submit button with correct text and attributes', () => {
    render(<InputForm />);
    const buttonElement = screen.getByRole('button', { name: /Check Facts/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveAttribute('type', 'submit');
    expect(buttonElement).toHaveClass('btn-primary');
  });

  test('maintains accessibility standards', () => {
    render(<InputForm />);
    const inputElement = screen.getByRole('textbox', { name: /Fact check input/i });
    const labelElement = screen.getByText(/Enter text to fact check:/i);
    
    expect(labelElement).toHaveAttribute('for', 'factInput');
    expect(inputElement).toHaveAttribute('id', 'factInput');
    expect(inputElement).toHaveAttribute('aria-label', 'Fact check input');
  });

  test('form has correct Bootstrap classes', () => {
    render(<InputForm />);
    const formElement = screen.getByRole('form', { name: /fact check form/i });
    const formGroupElement = formElement.querySelector('.mb-3');
    
    expect(formElement).toHaveClass('mb-4');
    expect(formGroupElement).toHaveClass('mb-3');
  });
}); 