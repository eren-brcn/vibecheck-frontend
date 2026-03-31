import { useState, useEffect } from 'react';
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
  IconButton
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import api from '../api';

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

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    instagramUrl: '',
    spotifyUrl: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    instagramUrl: '',
    spotifyUrl: ''
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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
        const res = await api.get('/auth/me');
        setUser(res.data);
        setFormData({
          username: res.data.username || '',
          instagramUrl: res.data.instagramUrl || '',
          spotifyUrl: res.data.spotifyUrl || ''
        });
      } catch (error) {
        console.error('Profile error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

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
      instagramUrl: user.instagramUrl || '',
      spotifyUrl: user.spotifyUrl || ''
    });
    setFieldErrors({
      username: '',
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

      const nextErrors = {
        username: trimmedUsername ? '' : 'Username is required.',
        instagramUrl: validateSocialUrl(normalizedInstagramUrl, 'instagram'),
        spotifyUrl: validateSocialUrl(normalizedSpotifyUrl, 'spotify')
      };

      setFieldErrors(nextErrors);
      setFormData((prev) => ({
        ...prev,
        username: trimmedUsername,
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
        instagramUrl: normalizedInstagramUrl,
        spotifyUrl: normalizedSpotifyUrl
      };

      const response = await api.put('/auth/me', payload);
      setUser(response.data);
      setFormData({
        username: response.data.username || '',
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
                <Button variant="outlined" onClick={() => setIsEditing(true)} sx={{ mt: 1 }}>
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