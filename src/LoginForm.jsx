import { useState } from 'react';
import api from './api'; 

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('authToken', response.data.token);
      
      alert('Login successful!');
      console.log('Full API Response:', response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Unknown error';
      alert('Login failed: ' + errorMessage);
    }
  };

  return (
    <form onSubmit={handleLogin}>
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
    </form>
  );
}

export default LoginForm;