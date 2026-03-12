import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2>VibeCheck</h2>
      <div className="nav-links">
        {/* Use the 'to' prop to point to your defined routes */}
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/discover">Discover</Link>
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