import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <img
        src="/logo.jpeg"
        alt="VibeCheck"
        style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
      />
      <div className="nav-links">
        {/* Use the 'to' prop to point to your defined routes */}
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/discover">Discover</Link>
        <Link to="/concerts">Concerts</Link>
        <Link to="/profile">My Profile</Link>
        
        <button onClick={() => {
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        }}>
          Logout
        </button>
      </div>
    </nav>
  );
}