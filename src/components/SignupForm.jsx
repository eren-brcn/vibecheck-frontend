import { useState } from 'react';
import api from '../api';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

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
    <form onSubmit={handleSignup}>
      <h2>Sign Up</h2>
      <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Register</button>
    </form>
  );
}
export default SignupForm;