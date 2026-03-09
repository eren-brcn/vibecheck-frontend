import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('authToken');
  
  // If no token exists redirect to login
  return token ? children : <Navigate to="/login" />;
}

export default PrivateRoute;