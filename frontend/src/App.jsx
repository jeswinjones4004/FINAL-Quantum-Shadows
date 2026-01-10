import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScannerHome from './components/ScannerHome';
import Login from './components/Login';
import LiveMonitor from './components/LiveMonitor';

// Auth Wrapper
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ScannerHome />} />
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/live-monitoring"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <LiveMonitor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
