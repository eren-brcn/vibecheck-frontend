import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <img
        src="/logo.jpeg"
        alt="VibeCheck"
        style={{ height: 72, maxWidth: 240, objectFit: 'contain', borderRadius: 10 }}
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