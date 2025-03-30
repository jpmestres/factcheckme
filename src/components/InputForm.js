import { Form, Button } from 'react-bootstrap';

function InputForm() {
  return (
    <Form className="mb-4" role="form" aria-label="fact check form">
      <Form.Group className="mb-3">
        <Form.Label htmlFor="factInput">Enter text to fact check:</Form.Label>
        <Form.Control
          id="factInput"
          type="text"
          placeholder="Enter your text here..."
          aria-label="Fact check input"
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Check Facts
      </Button>
    </Form>
  );
}

export default InputForm; 