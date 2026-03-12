import { Routes, Route, Navigate } from 'react-router-dom';
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
function App() {
  return (
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
        <Route path="group-details/:groupId" element={<GroupDetails />} />
        <Route path="chat/:roomId" element={<Chat />} />
        <Route path="chat/group/:groupId" element={<Chat />} />
        <Route path="chat/dm/:friendId" element={<Chat />} />
        <Route index element={<Navigate to="dashboard" />} />
      </Route>

      {/* Redirect unknown routes to login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;