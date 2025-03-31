import React from 'react';
import { Card } from 'react-bootstrap';

/**
 * ResultCard component for displaying fact-checking results
 * @param {Object} props - Component props
 * @param {Object} props.result - Fact-checking result object
 * @returns {JSX.Element} Rendered component
 */
function ResultCard({ result }) {
  if (!result || result.error) {
    return (
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Text className="text-danger">
            {result?.error || 'An error occurred while fact-checking.'}
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }

  const getBackgroundColor = (grade) => {
    switch (grade.toLowerCase()) {
      case 'absolutely false':
        return '#dc3545'; // Dark red
      case 'mostly false':
        return '#ff6b6b'; // Light red
      case 'neutral':
        return '#ffd93d'; // Yellow
      case 'mostly true':
        return '#6bff6b'; // Light green
      case 'truth':
        return '#28a745'; // Full green
      default:
        return '#6c757d'; // Gray for unknown
    }
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Card.Title 
          className="mb-3" 
          style={{ 
            color: 'white',
            backgroundColor: getBackgroundColor(result.grade),
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            display: 'inline-block'
          }}
        >
          {result.grade}
        </Card.Title>
        <Card.Text>
          <strong>Reasoning:</strong> {result.reasoning}
        </Card.Text>
        <Card.Text>
          <strong>Sources:</strong> {result.sources}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default ResultCard; 