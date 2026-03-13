import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">VibeCheck</Link>
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