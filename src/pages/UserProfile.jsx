import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import api from '../api';
import { maskEmail } from '../utils/maskEmail';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [privateGroups, setPrivateGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const primaryActionSx = {
    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
    color: '#fff',
    fontWeight: 700,
    '&:hover': {
      background: 'linear-gradient(90deg, var(--primary-strong), var(--accent))',
      boxShadow: '0 0 0 1px rgba(255, 79, 216, 0.35), 0 10px 24px rgba(122, 46, 255, 0.35)'
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const [userRes, meRes, groupsRes] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get('/auth/me'),
          api.get('/groups/my-groups')
        ]);

        setUser(userRes.data);

        const myId = String(meRes.data._id || meRes.data.id || '').trim();
        const privateOwnedGroups = (groupsRes.data || []).filter((group) => {
          const organiserId = group.organiser
            ? String(typeof group.organiser === 'object' ? group.organiser._id : group.organiser).trim()
            : '';
          return group.isPrivate && organiserId === myId;
        });

        setPrivateGroups(privateOwnedGroups);
        if (privateOwnedGroups[0]?._id) {
          setSelectedGroupId(privateOwnedGroups[0]._id);
        }
      } catch (error) {
        setMessageType('error');
        setMessage(error.response?.data?.message || 'Could not load user profile.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  const handleAddFriend = async () => {
    if (!user) return;

    try {
      setAdding(true);
      setMessage('');
      await api.post(`/users/${user._id}/friend`);
      setUser((prev) => ({ ...prev, friendRequestStatus: 'sent' }));
      setMessageType('success');
      setMessage('Friend request sent.');
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Could not send friend request.');
    } finally {
      setAdding(false);
    }
  };

  const handleInviteToGroup = async () => {
    if (!user || !selectedGroupId) {
      return;
    }

    try {
      setInviting(true);
      setMessage('');
      await api.post('/users/group-invites', {
        targetUserId: user._id,
        groupId: selectedGroupId
      });
      setMessageType('success');
      setMessage('Group invite sent.');
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Could not send group invite.');
    } finally {
      setInviting(false);
    }
  };

  const handleBlockUser = async () => {
    if (!user) return;
    if (!window.confirm('Block this user? They will be removed from your friends list and hidden from search.')) return;

    try {
      setBlocking(true);
      setMessage('');
      await api.post(`/users/${user._id}/block`);
      setUser((prev) => ({ ...prev, isBlocked: true }));
      setMessageType('success');
      setMessage('User blocked.');
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Could not block user.');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!user) return;
    if (!window.confirm('Unblock this user?')) return;

    try {
      setBlocking(true);
      setMessage('');
      await api.post(`/users/${user._id}/unblock`);
      setUser((prev) => ({ ...prev, isBlocked: false }));
      setMessageType('success');
      setMessage('User unblocked.');
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Could not unblock user.');
    } finally {
      setBlocking(false);
    }
  };

  const getFriendButtonLabel = () => {
    if (!user) return 'Add Friend';
    if (user.isFriend || user.friendRequestStatus === 'friends') return 'Already Friends';
    if (user.friendRequestStatus === 'sent') return 'Request Sent';
    if (user.friendRequestStatus === 'received') return 'Requested You';
    return 'Add Friend';
  };

  const disableFriendButton = adding || user?.isFriend || user?.friendRequestStatus === 'friends' || user?.friendRequestStatus === 'sent';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3, maxWidth: 520, mx: 'auto' }}>
        <Typography>User not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 520, mx: 'auto' }}>
      <Button variant="outlined" sx={{ mb: 2 }} onClick={() => navigate(-1)}>
        Back
      </Button>

      <Card sx={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <CardContent>
          <Stack alignItems="center" spacing={1.5}>
            <Avatar src={user.imageUrl || undefined} sx={{ width: 96, height: 96 }}>
              {(user.username || '?').charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h4">{user.username || 'User'}</Typography>
            <Typography variant="body1" color="text.secondary">{maskEmail(user.email) || 'No email'}</Typography>

            {user.instagramUrl ? (
              <Link href={user.instagramUrl} target="_blank" rel="noreferrer" underline="hover">Instagram</Link>
            ) : (
              <Typography variant="body2" color="text.secondary">Instagram not connected</Typography>
            )}

            {user.spotifyUrl ? (
              <Link href={user.spotifyUrl} target="_blank" rel="noreferrer" underline="hover">Spotify</Link>
            ) : (
              <Typography variant="body2" color="text.secondary">Spotify not connected</Typography>
            )}

            <Button
              variant={user.isFriend || user.friendRequestStatus === 'friends' ? 'outlined' : 'contained'}
              disabled={disableFriendButton}
              sx={user.isFriend || user.friendRequestStatus === 'friends' ? undefined : primaryActionSx}
              onClick={handleAddFriend}
            >
              {adding ? 'Sending...' : getFriendButtonLabel()}
            </Button>

            {user.isBlocked ? (
              <Button
                variant="outlined"
                disabled={blocking}
                onClick={handleUnblockUser}
                sx={{ color: '#22c55e', borderColor: '#22c55e' }}
              >
                {blocking ? 'Unblocking...' : 'Unblock User'}
              </Button>
            ) : (
              <Button
                variant="outlined"
                disabled={blocking}
                onClick={handleBlockUser}
                sx={{ color: '#ffb3cc', borderColor: 'rgba(255, 79, 216, 0.45)' }}
              >
                {blocking ? 'Blocking...' : 'Block User'}
              </Button>
            )}

            {privateGroups.length > 0 && (
              <Stack spacing={1.2} sx={{ width: '100%', mt: 1 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="invite-group-label">Invite To Group</InputLabel>
                  <Select
                    labelId="invite-group-label"
                    value={selectedGroupId}
                    label="Invite To Group"
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                  >
                    {privateGroups.map((group) => (
                      <MenuItem key={group._id} value={group._id}>{group.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  disabled={inviting || !selectedGroupId}
                  onClick={handleInviteToGroup}
                >
                  {inviting ? 'Sending Invite...' : 'Send Group Invite'}
                </Button>
              </Stack>
            )}
          </Stack>

          {message && (
            <Alert sx={{ mt: 2 }} severity={messageType}>
              {message}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
