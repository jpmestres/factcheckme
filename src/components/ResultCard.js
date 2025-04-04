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

  console.log('ResultCard received result:', result);
  console.log('Grade value:', result.grade);
  console.log('Grade type:', typeof result.grade);

  const getBackgroundColor = (grade) => {
    console.log('getBackgroundColor called with grade:', grade);
    console.log('Grade type in function:', typeof grade);
    
    // Normalize the grade string
    const normalizedGrade = grade.trim();
    
    switch (normalizedGrade) {
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
        console.log('No matching grade found, using default color');
        return '#6c757d'; // Gray for unknown
    }
  };

  const backgroundColor = getBackgroundColor(result.grade);
  console.log('Selected background color:', backgroundColor);

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Card.Title 
          className="mb-3" 
          style={{ 
            color: 'white',
            backgroundColor: backgroundColor,
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