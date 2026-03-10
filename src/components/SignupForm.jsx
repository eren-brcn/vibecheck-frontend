import { useState } from 'react';
import api from '../api';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', { email, password });
      alert('Signup successful! Redirecting to login...');
      window.location.href = '/login'; // Or use useNavigate
    } catch (err) {
      alert('Signup failed.');
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Sign Up</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Register</button>
    </form>
  );
}
export default SignupForm;