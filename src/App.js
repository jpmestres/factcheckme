import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Navbar } from 'react-bootstrap';
import InputForm from './components/InputForm';
import AdSense from './components/AdSense';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * Get the background color based on the grade
 * @param {string} grade - The grade from the API
 * @returns {string} The background color in hex format
 */
const getBackgroundColor = (grade) => {
  switch (grade) {
    case 'Absolutely False':
      return '#dc3545'; // Dark red
    case 'Mostly False':
      return '#ff6b6b'; // Light red
    case 'Neutral':
      return '#ffd93d'; // Yellow
    case 'Mostly True':
      return '#6bff6b'; // Light green
    case 'Truth':
      return '#28a745'; // Full green
    default:
      return '#ffffff'; // White for no grade
  }
};

/**
 * Convert numeric grade to text description
 * @param {number} grade - The numeric grade from the API (1-5)
 * @returns {string} The text description of the grade
 */
const getGradeText = (grade) => {
  switch (grade) {
    case 1:
      return 'Absolutely False';
    case 2:
      return 'Mostly False';
    case 3:
      return 'Neutral';
    case 4:
      return 'Mostly True';
    case 5:
      return 'Truth';
    default:
      return 'Unknown';
  }
};

/**
 * Format sources string into an array of clickable links
 * @param {string} sources - The sources string from the API
 * @returns {Array} Array of JSX elements for each source link
 */
const formatSources = (sources) => {
  if (!sources) return null;
  
  // Split the sources string by commas and clean up each source
  return sources.split(',').map(source => {
    // Remove leading/trailing whitespace and dashes
    const cleanSource = source.trim().replace(/^-?\s*/, '');
    
    // Check if it's a URL
    if (cleanSource.startsWith('http')) {
      return (
        <div key={cleanSource} className="mb-2">
          <a 
            href={cleanSource}
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none"
            onClick={(e) => {
              e.preventDefault();
              window.open(cleanSource, '_blank');
            }}
          >
            <i className="fas fa-external-link-alt me-1"></i>
            {cleanSource}
          </a>
        </div>
      );
    }
    
    // If not a URL, return as plain text
    return <div key={cleanSource} className="mb-2">{cleanSource}</div>;
  });
};

/**
 * Main App component
 * @returns {JSX.Element} Rendered component
 */
function App() {
  const [factCheckResponse, setFactCheckResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load AdSense script
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5578074907187073';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.head.removeChild(script);
    };
  }, []);

  /**
   * Handles the fact check response from the API
   * @param {Object} response - The API response data
   */
  const handleFactCheckResponse = (response) => {
    if (response.error) {
      setError(response.error);
      setFactCheckResponse(null);
    } else {
      setError(null);
      setFactCheckResponse(response);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="#home" className="fs-4">
            <i className="fas fa-check-circle me-2"></i>
            truthcheck.me
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Container 
        className="flex-grow-1 py-5" 
        role="main"
        style={{
          backgroundColor: getBackgroundColor(factCheckResponse?.grade),
          transition: 'background-color 0.3s ease',
          minHeight: '100vh'
        }}
      >
        <Row className="justify-content-center">
          <Col className="col-12 col-md-8 col-lg-6">
            <div className="text-center mb-5">
              <h1 className="text-center mb-4">Truth Checker</h1>
              <p className="lead text-muted">
                Enter any statement to check its factual accuracy using AI
              </p>
            </div>

            <InputForm onSubmit={handleFactCheckResponse} />

            {error && (
              <Alert variant="danger" className="mt-4 shadow-sm">
                <Alert.Heading className="d-flex align-items-center">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  Error
                </Alert.Heading>
                <p className="mb-0">{error}</p>
              </Alert>
            )}

            {factCheckResponse && !error && (
              <Card className="mt-4 shadow-sm" role="region" aria-label="Fact check result">
                <Card.Header className={`${factCheckResponse.grade ? 'bg-primary' : 'bg-danger'} text-white py-3`}>
                  <div className="d-flex align-items-center">
                    <i className={`fas ${factCheckResponse.grade ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                    {factCheckResponse.grade ? 'Fact Check Result' : 'Error'}
                  </div>
                </Card.Header>
                <Card.Body className="p-4">
                  {factCheckResponse.grade ? (
                    <>
                      <Card.Text><strong>Grade:</strong> {factCheckResponse.grade}</Card.Text>
                      <Card.Text><strong>Reasoning:</strong> {factCheckResponse.reasoning}</Card.Text>
                      <div>
                        <strong>Sources:</strong>
                        {formatSources(factCheckResponse.sources)}
                      </div>
                    </>
                  ) : (
                    <Card.Text>Unexpected response format received from the API.</Card.Text>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* AdSense ad placed below the AI response */}
            <div className="mt-5">
              <AdSense />
            </div>
          </Col>
        </Row>
      </Container>

      <footer className="bg-dark text-light py-4 mt-auto">
        <Container>
          <Row>
            <Col className="text-center">
              <p className="mb-0">© 2024 Jean-Paul Mestres. All rights reserved.</p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default App;
