import { Outlet } from 'react-router-dom';
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="layout-wrapper">
      <Navbar className="navbar" />
      <Sidebar className="sidebar" />
      
      <main className="content">
        {children ?? <Outlet />}
      </main>
      
      <Footer className="footer" />
    </div>
  );
}