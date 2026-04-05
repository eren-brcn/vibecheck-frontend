import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import GroupDetails from './pages/GroupDetails';
import Concerts from './pages/Concerts';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import NotificationHistory from './pages/NotificationHistory';
function App() {
  return (
    <>
    <Toaster position="top-center" toastOptions={{ style: { background: '#1f0425', color: '#fff', border: '1px solid rgba(255,79,216,0.3)' } }} />
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />

      {/* Protected Routes (Wrapped in Layout) */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="discover" element={<Discover />} />
        <Route path="concerts" element={<Concerts />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<NotificationHistory />} />
        <Route path="users/:userId" element={<UserProfile />} />
        <Route path="group-details/:groupId" element={<GroupDetails />} />
        <Route path="chat/:roomId" element={<Chat />} />
        <Route path="chat/group/:groupId" element={<Chat />} />
        <Route path="chat/dm/:friendId" element={<Chat />} />
        <Route index element={<Navigate to="dashboard" />} />
      </Route>

      {/* Redirect unknown routes to login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
    </>
  );
}

export default App;