import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const FirebaseTest = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        console.log('Testing Firebase connection...');
        const servicesRef = collection(db, 'services');
        const snapshot = await getDocs(servicesRef);
        
        const servicesData = [];
        snapshot.forEach((doc) => {
          servicesData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log('Services loaded:', servicesData);
        setServices(servicesData);
      } catch (err) {
        console.error('Firebase error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testFirebase();
  }, []);

  if (loading) return <div>Loading Firebase test...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Firebase Test Results</h3>
      <p>Services found: {services.length}</p>
      {services.map(service => (
        <div key={service.id} style={{ marginBottom: '10px', padding: '10px', background: '#f5f5f5' }}>
          <strong>{service.name}</strong>
          <br />
          <small>ID: {service.id}</small>
          <br />
          <small>Subservices: {service.subservices?.length || 0}</small>
        </div>
      ))}
    </div>
  );
};

export default FirebaseTest;