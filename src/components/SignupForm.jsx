import { useState } from 'react';
import api from '../api';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const fieldStyle = {
    width: '100%',
    background: 'var(--panel-soft)',
    color: 'var(--text-main)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '0.75rem'
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', { username, email, password });
      alert('Signup successful! Redirecting to login...');
      window.location.href = '/login'; 
} catch (err) {
  console.error("DEBUG ERROR:", err); // This will stay visible in the Console tab
  if (err.response) {
    console.error("SERVER SAYS:", err.response.data);
  } else {
    console.error("NETWORK ERROR:", err.message);
  }
}
  };

  return (
    <form
      onSubmit={handleSignup}
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
      <h2 style={{ marginBottom: '0.25rem', color: 'var(--text-main)' }}>Sign Up</h2>
      <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} style={fieldStyle} />
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={fieldStyle} />
      <button type="submit">Register</button>
    </form>
  );
}
export default SignupForm;