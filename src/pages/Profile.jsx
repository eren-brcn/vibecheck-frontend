import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Button,
  Stack,
  TextField,
  Alert,
  Link,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import api from '../api';
import { initSocket, joinNotifications } from '../socket';

const normalizeSocialInput = (value, platform) => {
  const raw = value.trim();
  if (!raw) {
    return '';
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  if (platform === 'instagram') {
    const withoutAt = raw.startsWith('@') ? raw.slice(1) : raw;
    if (/^(www\.)?instagram\.com\//i.test(withoutAt)) {
      return `https://${withoutAt}`;
    }
    if (/^[A-Za-z0-9._]+$/.test(withoutAt)) {
      return `https://instagram.com/${withoutAt}`;
    }
  }

  if (platform === 'spotify') {
    if (/^(open\.)?spotify\.com\//i.test(raw) || /^www\.spotify\.com\//i.test(raw)) {
      return `https://${raw}`;
    }
    if (/^[A-Za-z0-9._-]+$/.test(raw)) {
      return `https://open.spotify.com/user/${raw}`;
    }
  }

  return raw;
};

const validateSocialUrl = (value, platform) => {
  if (!value) {
    return '';
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return 'Enter a valid URL.';
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return 'URL must start with http:// or https://';
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.replace(/\/+$/, '');

  if (platform === 'instagram') {
    if (!['instagram.com', 'www.instagram.com', 'm.instagram.com'].includes(hostname)) {
      return 'Use an instagram.com link.';
    }
    if (!pathname || pathname === '/') {
      return 'Instagram link must include a profile path.';
    }
  }

  if (platform === 'spotify') {
    if (!['open.spotify.com', 'spotify.com', 'www.spotify.com'].includes(hostname)) {
      return 'Use a spotify.com link.';
    }
    if (!pathname || pathname === '/') {
      return 'Spotify link must include a profile/content path.';
    }
  }

  return '';
};

const formatLastSeen = (timestamp) => {
  if (!timestamp) {
    return 'Offline';
  }

  const diffMs = Date.now() - Number(timestamp);
  if (diffMs < 60 * 1000) {
    return 'Last seen just now';
  }

  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 60) {
    return `Last seen ${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Last seen ${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `Last seen ${days}d ago`;
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    musicGenre: '',
    instagramUrl: '',
    spotifyUrl: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    bio: '',
    musicGenre: '',
    instagramUrl: '',
    spotifyUrl: ''
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [unfriendingId, setUnfriendingId] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordChanging, setPasswordChanging] = useState(false);

  const loadFriends = useCallback(async () => {
    try {
      const friendsRes = await api.get('/users/friends');
      setFriends(friendsRes.data || []);
    } catch {
      setFriends([]);
    }
  }, []);

  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => {
      const onlineScore = Number(Boolean(b.isOnline)) - Number(Boolean(a.isOnline));
      if (onlineScore !== 0) {
        return onlineScore;
      }

      return String(a.username || '').localeCompare(String(b.username || ''));
    });
  }, [friends]);

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
    const fetchUser = async () => {
      try {
        const [meRes] = await Promise.all([api.get('/auth/me'), loadFriends()]);

        setUser(meRes.data);
        setFormData({
          username: meRes.data.username || '',
          bio: meRes.data.bio || '',
          musicGenre: meRes.data.musicGenre || '',
          instagramUrl: meRes.data.instagramUrl || '',
          spotifyUrl: meRes.data.spotifyUrl || ''
        });
      } catch (error) {
        console.error('Profile error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [loadFriends]);

  useEffect(() => {
    const socket = initSocket();
    if (!user?._id) {
      return;
    }

    joinNotifications();

    const handlePresenceUpdate = ({ userId, isOnline }) => {
      if (!userId) {
        return;
      }

      setFriends((prev) => prev.map((friend) => (
        String(friend._id) === String(userId)
          ? { ...friend, isOnline: Boolean(isOnline) }
          : friend
      )));
    };

    const handleSocketReconnect = () => {
      joinNotifications();
      loadFriends();
    };

    socket.on('presence:update', handlePresenceUpdate);
    socket.on('connect', handleSocketReconnect);
    return () => {
      socket.off('presence:update', handlePresenceUpdate);
      socket.off('connect', handleSocketReconnect);
    };
  }, [user?._id, loadFriends]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!user) {
    return (
      <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
        <Typography>User not found.</Typography>
      </Box>
    );
  }

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const updatedUser = await api.put('/auth/me/photo', {
        imageUrl: uploadResponse.data.imageUrl
      });

      setUser(updatedUser.data);
      setStatusType('success');
      setStatusMessage('Profile photo updated.');
    } catch (error) {
      console.error('Photo upload error:', error);
      setStatusType('error');
      setStatusMessage('Could not upload photo. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSocialBlur = (fieldName, platform) => {
    const normalized = normalizeSocialInput(formData[fieldName], platform);
    const error = validateSocialUrl(normalized, platform);

    setFormData((prev) => ({ ...prev, [fieldName]: normalized }));
    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const handleCancelEdit = () => {
    setFormData({
      username: user.username || '',
      bio: user.bio || '',
      musicGenre: user.musicGenre || '',
      instagramUrl: user.instagramUrl || '',
      spotifyUrl: user.spotifyUrl || ''
    });
    setFieldErrors({
      username: '',
      bio: '',
      musicGenre: '',
      instagramUrl: '',
      spotifyUrl: ''
    });
    setIsEditing(false);
    setStatusMessage('');
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setStatusMessage('');

      const normalizedInstagramUrl = normalizeSocialInput(formData.instagramUrl, 'instagram');
      const normalizedSpotifyUrl = normalizeSocialInput(formData.spotifyUrl, 'spotify');
      const trimmedUsername = formData.username.trim();
      const trimmedBio = formData.bio.trim();
      const trimmedMusicGenre = formData.musicGenre.trim();

      const nextErrors = {
        username: trimmedUsername ? '' : 'Username is required.',
        bio: '',
        musicGenre: '',
        instagramUrl: validateSocialUrl(normalizedInstagramUrl, 'instagram'),
        spotifyUrl: validateSocialUrl(normalizedSpotifyUrl, 'spotify')
      };

      setFieldErrors(nextErrors);
      setFormData((prev) => ({
        ...prev,
        username: trimmedUsername,
        bio: trimmedBio,
        musicGenre: trimmedMusicGenre,
        instagramUrl: normalizedInstagramUrl,
        spotifyUrl: normalizedSpotifyUrl
      }));

      if (nextErrors.username || nextErrors.instagramUrl || nextErrors.spotifyUrl) {
        setStatusType('error');
        setStatusMessage('Please fix the highlighted fields before saving.');
        setSaving(false);
        return;
      }

      const payload = {
        username: trimmedUsername,
        bio: trimmedBio,
        musicGenre: trimmedMusicGenre,
        instagramUrl: normalizedInstagramUrl,
        spotifyUrl: normalizedSpotifyUrl
      };

      const response = await api.put('/auth/me', payload);
      setUser(response.data);
      setFormData({
        username: response.data.username || '',
        bio: response.data.bio || '',
        musicGenre: response.data.musicGenre || '',
        instagramUrl: response.data.instagramUrl || '',
        spotifyUrl: response.data.spotifyUrl || ''
      });
      setIsEditing(false);
      setStatusType('success');
      setStatusMessage('Profile updated successfully.');
    } catch (error) {
      console.error('Profile update error:', error);
      setStatusType('error');
      setStatusMessage(error.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async (platform) => {
    try {
      setDisconnecting(platform);
      setStatusMessage('');

      const payload =
        platform === 'instagram'
          ? { instagramUrl: '' }
          : { spotifyUrl: '' };

      const response = await api.put('/auth/me', payload);
      setUser(response.data);
      setFormData((prev) => ({
        ...prev,
        instagramUrl: response.data.instagramUrl || '',
        spotifyUrl: response.data.spotifyUrl || ''
      }));

      setStatusType('success');
      setStatusMessage(
        platform === 'instagram'
          ? 'Instagram disconnected.'
          : 'Spotify disconnected.'
      );
    } catch (error) {
      console.error('Disconnect error:', error);
      setStatusType('error');
      setStatusMessage(error.response?.data?.message || 'Could not disconnect account.');
    } finally {
      setDisconnecting('');
    }
  };

  const handleUnfriend = async (friendId) => {
    if (!window.confirm('Remove this friend?')) {
      return;
    }

    try {
      setUnfriendingId(friendId);
      await api.post(`/users/${friendId}/unfriend`);
      setFriends((prev) => prev.filter((f) => String(f._id) !== String(friendId)));
      setStatusType('success');
      setStatusMessage('Friend removed.');
    } catch (error) {
      setStatusType('error');
      setStatusMessage(error.response?.data?.message || 'Could not remove friend.');
    } finally {
      setUnfriendingId(null);
    }
  };

  const handlePasswordChange = async () => {
    const errors = {};

    if (!passwordData.oldPassword) {
      errors.oldPassword = 'Current password is required.';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required.';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.';
    }

    if (passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setPasswordChanging(true);
      setPasswordErrors({});
      await api.post('/auth/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      setStatusType('success');
      setStatusMessage('Password changed successfully.');
    } catch (error) {
      if (error.response?.status === 401) {
        setPasswordErrors({ oldPassword: 'Current password is incorrect.' });
      } else {
        setStatusType('error');
        setStatusMessage(error.response?.data?.message || 'Could not change password.');
      }
    } finally {
      setPasswordChanging(false);
    }
  };

  const handleCancelPassword = () => {
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
    setShowPasswordForm(false);
  };

  const handlePasswordFieldChange = (event) => {
    const { name, value } = event.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const hasInstagram = Boolean(user.instagramUrl);
  const hasSpotify = Boolean(user.spotifyUrl);

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Card sx={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src="/logo.jpeg"
            alt="VibeCheck logo"
            sx={{
              width: 120,
              height: 120,
              objectFit: 'cover',
              borderRadius: 2,
              mb: 2,
              border: '1px solid var(--border)'
            }}
          />
          <Avatar src={user.imageUrl || undefined} sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}>
            {(user.username || user.name || '?').charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h4">{user.username || 'User'}</Typography>
          <Typography variant="body1" color="text.secondary">{user.email || 'No email'}</Typography>
          <Button component="label" variant="contained" sx={{ mt: 2, ...primaryActionSx }} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Photo'}
            <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
          </Button>

          {statusMessage && (
            <Alert sx={{ mt: 2, textAlign: 'left' }} severity={statusType}>
              {statusMessage}
            </Alert>
          )}

          <Stack spacing={1.5} sx={{ mt: 3, textAlign: 'left' }}>
            {!isEditing && (
              <>
                {user.bio && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>About</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {user.bio}
                    </Typography>
                  </>
                )}
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Connected accounts</Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ border: '1px solid var(--border)', borderRadius: 2, px: 1.5, py: 1 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <InstagramIcon fontSize="small" />
                    {hasInstagram ? (
                      <Link href={user.instagramUrl} target="_blank" rel="noreferrer" underline="hover">
                        Instagram connected
                      </Link>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Instagram not connected</Typography>
                    )}
                  </Stack>
                  {hasInstagram && (
                    <IconButton
                      aria-label="Disconnect Instagram"
                      size="small"
                      disabled={disconnecting === 'instagram'}
                      onClick={() => handleDisconnect('instagram')}
                    >
                      <LinkOffIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ border: '1px solid var(--border)', borderRadius: 2, px: 1.5, py: 1 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <HeadphonesIcon fontSize="small" />
                    {hasSpotify ? (
                      <Link href={user.spotifyUrl} target="_blank" rel="noreferrer" underline="hover">
                        Spotify connected
                      </Link>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Spotify not connected</Typography>
                    )}
                  </Stack>
                  {hasSpotify && (
                    <IconButton
                      aria-label="Disconnect Spotify"
                      size="small"
                      disabled={disconnecting === 'spotify'}
                      onClick={() => handleDisconnect('spotify')}
                    >
                      <LinkOffIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2.5 }}>Security</Typography>
                {!showPasswordForm ? (
                  <Button variant="contained" onClick={() => setShowPasswordForm(true)} sx={{ ...primaryActionSx }}>
                    Change Password
                  </Button>
                ) : (
                  <>
                    <TextField
                      label="Current Password"
                      name="oldPassword"
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordFieldChange}
                      error={Boolean(passwordErrors.oldPassword)}
                      helperText={passwordErrors.oldPassword || ''}
                      fullWidth
                    />
                    <TextField
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordFieldChange}
                      error={Boolean(passwordErrors.newPassword)}
                      helperText={passwordErrors.newPassword || ''}
                      fullWidth
                    />
                    <TextField
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordFieldChange}
                      error={Boolean(passwordErrors.confirmPassword)}
                      helperText={passwordErrors.confirmPassword || ''}
                      fullWidth
                    />
                    <Stack direction="row" spacing={1.5}>
                      <Button 
                        variant="contained" 
                        sx={primaryActionSx} 
                        disabled={passwordChanging}
                        onClick={handlePasswordChange}
                      >
                        {passwordChanging ? 'Updating...' : 'Update Password'}
                      </Button>
                      <Button 
                        variant="outlined" 
                        disabled={passwordChanging}
                        onClick={handleCancelPassword}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </>
                )}

                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2.5 }}>Friends</Typography>
                {friends.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No friends yet.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {sortedFriends.map((friend) => (
                      <Stack
                        key={friend._id}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ border: '1px solid var(--border)', borderRadius: 2, px: 1.5, py: 1 }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.2}>
                          <Avatar src={friend.imageUrl || undefined} sx={{ width: 28, height: 28 }}>
                            {(friend.username || '?').charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2">{friend.username || 'Friend'}</Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={0.8}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: friend.isOnline ? '#22c55e' : '#94a3b8',
                                boxShadow: friend.isOnline ? '0 0 0 2px rgba(34, 197, 94, 0.2)' : 'none'
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {friend.isOnline ? 'Online' : formatLastSeen(friend.lastSeen)}
                            </Typography>
                          </Stack>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/users/${friend._id}`)}
                            sx={{ mr: 0.5 }}
                          >
                            Profile
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/chat/dm/${friend._id}`)}
                            sx={{ mr: 0.5 }}
                          >
                            Chat
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={unfriendingId === String(friend._id)}
                            onClick={() => handleUnfriend(friend._id)}
                            sx={{ color: '#ffb3cc', borderColor: 'rgba(255, 79, 216, 0.45)' }}
                          >
                            {unfriendingId === String(friend._id) ? 'Removing...' : 'Unfriend'}
                          </Button>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                )}

                <Button variant="contained" onClick={() => setIsEditing(true)} sx={{ mt: 1, ...primaryActionSx }}>
                  Edit Profile
                </Button>
              </>
            )}

            {isEditing && (
              <>
                <TextField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  error={Boolean(fieldErrors.username)}
                  helperText={fieldErrors.username || 'This is your public display name.'}
                  fullWidth
                />
                <TextField
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleFormChange}
                  error={Boolean(fieldErrors.bio)}
                  helperText={fieldErrors.bio || 'Tell others about yourself (max 500 characters)'}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Write a short bio..."
                />
                <FormControl fullWidth>
                  <InputLabel>Favorite Music Genre</InputLabel>
                  <Select
                    name="musicGenre"
                    value={formData.musicGenre}
                    label="Favorite Music Genre"
                    onChange={handleFormChange}
                  >
                    <MenuItem value="">Not specified</MenuItem>
                    <MenuItem value="rock">Rock</MenuItem>
                    <MenuItem value="pop">Pop</MenuItem>
                    <MenuItem value="hip-hop">Hip-Hop</MenuItem>
                    <MenuItem value="jazz">Jazz</MenuItem>
                    <MenuItem value="classical">Classical</MenuItem>
                    <MenuItem value="electronic">Electronic</MenuItem>
                    <MenuItem value="country">Country</MenuItem>
                    <MenuItem value="r&b">R&B</MenuItem>
                    <MenuItem value="indie">Indie</MenuItem>
                    <MenuItem value="metal">Metal</MenuItem>
                    <MenuItem value="folk">Folk</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Instagram URL"
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleFormChange}
                  onBlur={() => handleSocialBlur('instagramUrl', 'instagram')}
                  error={Boolean(fieldErrors.instagramUrl)}
                  helperText={fieldErrors.instagramUrl || 'Paste a full link or @handle.'}
                  fullWidth
                  placeholder="https://instagram.com/your-handle"
                />
                <TextField
                  label="Spotify URL"
                  name="spotifyUrl"
                  value={formData.spotifyUrl}
                  onChange={handleFormChange}
                  onBlur={() => handleSocialBlur('spotifyUrl', 'spotify')}
                  error={Boolean(fieldErrors.spotifyUrl)}
                  helperText={fieldErrors.spotifyUrl || 'Paste a full Spotify profile/content link.'}
                  fullWidth
                  placeholder="https://open.spotify.com/user/your-id"
                />
                <Stack direction="row" spacing={1.5}>
                  <Button variant="contained" sx={primaryActionSx} disabled={saving} onClick={handleSaveProfile}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outlined" disabled={saving} onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}