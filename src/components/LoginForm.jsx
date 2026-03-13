import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import api from '../api';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate(); 

  const fieldStyle = {
    width: '100%',
    background: 'var(--panel-soft)',
    color: 'var(--text-main)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '0.75rem'
  };

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
    <form
      onSubmit={handleLogin}
      style={{
        maxWidth: 420,
        margin: '4rem auto',
        padding: '1.5rem',
        borderRadius: 14,
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.9rem'
      }}
    >
      <img
        src="/logo.jpeg"
        alt="VibeCheck logo"
        style={{
          width: 120,
          height: 120,
          objectFit: 'cover',
          borderRadius: 14,
          alignSelf: 'center',
          marginBottom: '0.25rem',
          border: '1px solid var(--border)'
        }}
      />
      <h2 style={{ marginBottom: '0.25rem', color: 'var(--text-main)' }}>Login</h2>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        style={fieldStyle}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        style={fieldStyle}
      />
      <button type="submit">Login</button>
      <p style={{ color: 'var(--text-dim)', marginTop: '0.4rem' }}>
        Don't have an account? <Link to="/signup" style={{ color: 'var(--text-main)' }}>Sign up</Link>
      </p>
    </form>
  );
}

export default LoginForm;