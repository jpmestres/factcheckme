import { Container, Card } from 'react-bootstrap';
import InputForm from './components/InputForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <Container className="py-5">
        <h1 className="mb-4">Fact Checker</h1>
        <InputForm />

        <Card>
          <Card.Body>
            <Card.Title>AI Response</Card.Title>
            <Card.Text>
              The fact-checking response will appear here...
            </Card.Text>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default App;
