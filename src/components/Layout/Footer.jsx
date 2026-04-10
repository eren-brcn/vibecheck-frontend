import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/about">About</Link>
        <span aria-hidden>•</span>
        <Link to="/terms">Terms</Link>
        <span aria-hidden>•</span>
        <Link to="/privacy">Privacy Policy</Link>
      </div>
      <p>© 2026 VibeCheck</p>
    </footer>
  );
}