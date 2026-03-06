import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import api from './api';
import LoginForm from './LoginForm';

function App() {
  const [count, setCount] = useState(0)


  return (
      <div>
        <h1>VibeCheck Login</h1>
        <LoginForm />
        </div>
  );
}
        

export default App
