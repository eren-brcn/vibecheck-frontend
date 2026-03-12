import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import api from '../api';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // 3. Store the token exactly as 'authToken' PrivateRoute can find it
      localStorage.setItem('authToken', response.data.token); 
      
      alert('Login successful!');
      
      // 4. Redirect the user to the Dashboard after success login
      navigate('/dashboard'); 
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Unknown error';
      alert('Login failed: ' + errorMessage);
    }
    
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input 
        type="email" 
        placeholder="Email" 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Password" 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Login</button>
      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
    </form>
  );
}

export default LoginForm;