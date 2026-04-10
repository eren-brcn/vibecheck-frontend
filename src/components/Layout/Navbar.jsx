import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import toast from 'react-hot-toast';
import api from '../../api';
import { initSocket, joinNotifications } from '../../socket';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState({ count: 0, friendRequests: [], groupInvites: [] });
  const [processingAction, setProcessingAction] = useState('');
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [genreFilter, setGenreFilter] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchWrapRef = useRef(null);
  const notificationsWrapRef = useRef(null);
  const userMenuWrapRef = useRef(null);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/users/notifications');
      setNotifications(res.data || { count: 0, friendRequests: [], groupInvites: [] });
    } catch {
      setNotifications({ count: 0, friendRequests: [], groupInvites: [] });
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/messages/unread-count');
      setUnreadMessageCount(res.data?.unreadCount || 0);
    } catch {
      setUnreadMessageCount(0);
    }
  };

  useEffect(() => {
    // Fetch initial notifications, unread count, and current user
    fetchNotifications();
    fetchUnreadCount();
    api.get('/auth/me').then((res) => setCurrentUser(res.data)).catch(() => {});

    // Initialize socket connection
    const socket = initSocket();

    // Join notifications room when a token exists.
    const token = localStorage.getItem('authToken');
    if (token) {
      joinNotifications();
    }

    // Listen for real-time notification events
    const handleFriendRequestNew = () => {
      fetchNotifications();
      toast.success('New friend request!');
    };
    const handleFriendRequestUpdated = () => fetchNotifications();
    const handleGroupInviteNew = () => {
      fetchNotifications();
    };
    const handleGroupInviteUpdated = () => fetchNotifications();
    const handleNewMessage = ({ fromUser, content }) => {
      const preview = content.substring(0, 40) + (content.length > 40 ? '...' : '');
      toast.success(`${fromUser}: ${preview}`);
      fetchUnreadCount();
    };

    socket.on('friend-request:new', handleFriendRequestNew);
    socket.on('friend-request:accepted', handleFriendRequestUpdated);
    socket.on('friend-request:declined', handleFriendRequestUpdated);
    socket.on('group-invite:new', handleGroupInviteNew);
    socket.on('group-invite:accepted', handleGroupInviteUpdated);
    socket.on('group-invite:declined', handleGroupInviteUpdated);
    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('friend-request:new', handleFriendRequestNew);
      socket.off('friend-request:accepted', handleFriendRequestUpdated);
      socket.off('friend-request:declined', handleFriendRequestUpdated);
      socket.off('group-invite:new', handleGroupInviteNew);
      socket.off('group-invite:accepted', handleGroupInviteUpdated);
      socket.off('group-invite:declined', handleGroupInviteUpdated);
      socket.off('message:new', handleNewMessage);
    };
  }, []);

  useEffect(() => {
    if (!genreFilter && (!trimmedQuery || trimmedQuery.length < 2)) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        const params = {};
        if (trimmedQuery) {
          params.q = trimmedQuery;
        }
        if (genreFilter) {
          params.genre = genreFilter;
        }
        const res = await api.get('/users/search', { params });
        setResults(res.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [trimmedQuery, genreFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        setShowResults(false);
      }

      if (notificationsWrapRef.current && !notificationsWrapRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuWrapRef.current && !userMenuWrapRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (userId) => {
    setShowResults(false);
    setQuery('');
    setResults([]);
    navigate(`/users/${userId}`);
  };

  const handleFriendRequestAction = async (requesterId, action) => {
    try {
      setProcessingAction(`friend-${requesterId}-${action}`);
      await api.post(`/users/friend-requests/${requesterId}/${action}`);
      await fetchNotifications();
    } finally {
      setProcessingAction('');
    }
  };

  const handleGroupInviteAction = async (inviteId, action) => {
    try {
      setProcessingAction(`invite-${inviteId}-${action}`);
      await api.post(`/users/group-invites/${inviteId}/${action}`);
      await fetchNotifications();
      if (action === 'accept') {
        window.dispatchEvent(new Event('groups:updated'));
      }
    } finally {
      setProcessingAction('');
    }
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">VibeCheck</Link>

      <div className="navbar-search-wrap" ref={searchWrapRef}>
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onFocus={() => setShowResults(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          className="navbar-search-input"
        />
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="navbar-genre-select"
        >
          <option value="">All Genres</option>
          <option value="rock">Rock</option>
          <option value="pop">Pop</option>
          <option value="hip-hop">Hip-Hop</option>
          <option value="jazz">Jazz</option>
          <option value="classical">Classical</option>
          <option value="electronic">Electronic</option>
          <option value="country">Country</option>
          <option value="r&b">R&B</option>
          <option value="indie">Indie</option>
          <option value="metal">Metal</option>
          <option value="folk">Folk</option>
          <option value="other">Other</option>
        </select>
        {showResults && (trimmedQuery.length >= 2 || Boolean(genreFilter) || loading) && (
          <div className="navbar-search-results">
            {loading && <div className="navbar-search-item muted">Searching...</div>}
            {!loading && results.length === 0 && (
              <div className="navbar-search-item muted">No users found.</div>
            )}
            {!loading && results.map((user) => (
              <button
                key={user._id}
                className="navbar-search-item"
                onClick={() => handleSelectUser(user._id)}
              >
                <span>{user.username}</span>
                <small>
                  {user.friendRequestStatus === 'friends'
                    ? 'Friend'
                    : user.friendRequestStatus === 'sent'
                      ? 'Request sent'
                      : user.friendRequestStatus === 'received'
                        ? 'Requested you'
                        : 'View profile'}
                </small>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="nav-links">
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'nav-active' : ''}>Dashboard</Link>
        <Link to="/discover" className={location.pathname === '/discover' ? 'nav-active' : ''}>Discover</Link>
        <Link to="/concerts" className={location.pathname === '/concerts' ? 'nav-active' : ''}>Concerts</Link>
        <Link to="/settings" className={location.pathname === '/settings' ? 'nav-active' : ''}>Settings</Link>

        <span className="navbar-divider" />

        <div className="navbar-user-menu-wrap" ref={userMenuWrapRef}>
          <button
            className="navbar-avatar-btn"
            onClick={() => setShowUserMenu((prev) => !prev)}
            aria-label="User menu"
          >
            {currentUser?.profilePicture ? (
              <img src={currentUser.profilePicture} alt="avatar" className="navbar-avatar-img" />
            ) : (
              <div className="navbar-avatar-fallback">
                {currentUser?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            {unreadMessageCount > 0 && <span className="navbar-notification-badge">{unreadMessageCount}</span>}
          </button>

          {showUserMenu && (
            <div className="navbar-user-menu">
              <button className="navbar-user-menu-item" onClick={() => { setShowUserMenu(false); navigate('/profile'); }}>
                Profile
              </button>
              <button className="navbar-user-menu-item" onClick={() => { setShowUserMenu(false); navigate('/chat'); }}>
                Messages
                {unreadMessageCount > 0 && <span className="navbar-user-menu-badge">{unreadMessageCount}</span>}
              </button>
              <button className="navbar-user-menu-item" onClick={() => { setShowUserMenu(false); navigate('/profile', { state: { scrollToFriends: true } }); }}>
                Friend List
              </button>
            </div>
          )}
        </div>

        <div className="navbar-notifications-wrap" ref={notificationsWrapRef}>
          <button
            className="navbar-notification-btn"
            onClick={() => {
              setShowNotifications((prev) => !prev);
              fetchNotifications();
            }}
            aria-label="Notifications"
          >
            <NotificationsIcon fontSize="small" />
            {notifications.count > 0 && <span className="navbar-notification-badge">{notifications.count}</span>}
          </button>

          {showNotifications && (
            <div className="navbar-notifications-panel">
              {notifications.count === 0 && (
                <div className="navbar-search-item muted">No new notifications.</div>
              )}

              {notifications.friendRequests.map((request) => (
                <div className="navbar-notification-item" key={`friend-${request._id}`}>
                  <div>
                    <strong>{request.fromUser?.username || 'User'}</strong>
                    <p>sent you a friend request</p>
                  </div>
                  <div className="notification-actions">
                    <button
                      disabled={processingAction === `friend-${request.fromUser?._id}-accept`}
                      onClick={() => handleFriendRequestAction(request.fromUser?._id, 'accept')}
                    >
                      Accept
                    </button>
                    <button
                      disabled={processingAction === `friend-${request.fromUser?._id}-decline`}
                      onClick={() => handleFriendRequestAction(request.fromUser?._id, 'decline')}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}

              {notifications.groupInvites.map((invite) => (
                <div className="navbar-notification-item" key={`invite-${invite._id}`}>
                  <div>
                    <strong>{invite.invitedBy?.username || 'User'}</strong>
                    <p>invited you to {invite.group?.name || 'a private group'}</p>
                  </div>
                  <div className="notification-actions">
                    <button
                      disabled={processingAction === `invite-${invite._id}-accept`}
                      onClick={() => handleGroupInviteAction(invite._id, 'accept')}
                    >
                      Accept
                    </button>
                    <button
                      disabled={processingAction === `invite-${invite._id}-decline`}
                      onClick={() => handleGroupInviteAction(invite._id, 'decline')}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
