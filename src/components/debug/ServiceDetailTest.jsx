import React from 'react';
import { useParams } from 'react-router-dom';

const ServiceDetailTest = () => {
  const { id } = useParams();
  
  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #blue', 
      margin: '20px',
      backgroundColor: '#e3f2fd'
    }}>
      <h3>ServiceDetail Debug Info</h3>
      <p><strong>Service ID from URL:</strong> {id || 'No ID found'}</p>
      <p><strong>URL Path:</strong> {window.location.pathname}</p>
      <p><strong>Full URL:</strong> {window.location.href}</p>
    </div>
  );
};

export default ServiceDetailTest;