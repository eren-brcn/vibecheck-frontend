import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField
} from '@mui/material';
import api from '../api';

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');
  const [saving, setSaving] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivating, setDeactivating] = useState(false);
  
  const [settings, setSettings] = useState({
    allowFriendRequests: true,
    allowMessagesFromFriends: true,
    allowMessagesFromEveryone: false,
    notifyOnFriendRequest: true,
    notifyOnMessage: true,
    notifyOnGroupInvite: true,
    theme: 'dark'
  });

  const applyTheme = (themeMode) => {
    const mode = themeMode === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
    localStorage.setItem('vibecheckTheme', mode);
    window.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme: mode } }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const settingsRes = await api.get('/users/settings');
        setSettings((prev) => ({ ...prev, ...(settingsRes.data || {}) }));
        applyTheme(settingsRes.data?.theme || 'dark');
      } catch (error) {
        console.error('Error fetching user:', error);
        setStatusType('error');
        setStatusMessage('Could not load settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSettingChange = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
    setStatusMessage('');
  };

  const handleThemeChange = (value) => {
    setSettings((prev) => ({
      ...prev,
      theme: value
    }));
    applyTheme(value);
    setStatusMessage('');
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setStatusMessage('');

      await api.put('/users/settings', settings);
      applyTheme(settings.theme);
      
      setStatusType('success');
      setStatusMessage('Settings saved successfully.');
    } catch (error) {
      console.error('Error saving settings:', error);
      setStatusType('error');
      setStatusMessage('Could not save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!deactivatePassword) {
      setStatusType('error');
      setStatusMessage('Enter your password to deactivate your account.');
      return;
    }

    const confirmed = window.confirm('Deactivate your account? You will be logged out immediately.');
    if (!confirmed) {
      return;
    }

    try {
      setDeactivating(true);
      setStatusMessage('');
      await api.post('/auth/deactivate', { password: deactivatePassword });
      localStorage.removeItem('authToken');
      navigate('/login');
    } catch (error) {
      setStatusType('error');
      setStatusMessage(error.response?.data?.message || 'Could not deactivate account. Please try again.');
    } finally {
      setDeactivating(false);
      setDeactivatePassword('');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/profile')}
          sx={{
            flex: 1,
            borderColor: 'var(--border)',
            color: 'var(--text-main)',
            '&:hover': {
              borderColor: 'var(--accent)',
              backgroundColor: 'rgba(155, 92, 255, 0.12)'
            }
          }}
        >
          Profile
        </Button>
        <Button
          variant="contained"
          sx={{
            flex: 1,
            background: 'linear-gradient(90deg, var(--primary), var(--accent))',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(90deg, var(--primary-strong), var(--accent))'
            }
          }}
        >
          Settings
        </Button>
      </Stack>

      <Card sx={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Settings
          </Typography>

          {statusMessage && (
            <Alert sx={{ mb: 2 }} severity={statusType}>
              {statusMessage}
            </Alert>
          )}

          <Stack spacing={2.5}>
            {/* Privacy Settings */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Privacy
              </Typography>
              <Stack spacing={1.5} sx={{ ml: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowFriendRequests}
                      onChange={() => handleSettingChange('allowFriendRequests')}
                    />
                  }
                  label="Allow friend requests"
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block', mt: -1 }}>
                  Other users can send you friend requests
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowMessagesFromFriends}
                      onChange={() => handleSettingChange('allowMessagesFromFriends')}
                    />
                  }
                  label="Allow messages from friends only"
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block', mt: -1 }}>
                  Restrict messages to friends you've accepted
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowMessagesFromEveryone}
                      onChange={() => handleSettingChange('allowMessagesFromEveryone')}
                      disabled={settings.allowMessagesFromFriends}
                    />
                  }
                  label="Allow messages from anyone"
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block', mt: -1 }}>
                  Anyone can message you (friends only must be off)
                </Typography>
              </Stack>
            </Box>

            <Divider />

            {/* Notification Settings */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Notifications
              </Typography>
              <Stack spacing={1.5} sx={{ ml: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifyOnFriendRequest}
                      onChange={() => handleSettingChange('notifyOnFriendRequest')}
                    />
                  }
                  label="Friend request notifications"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifyOnMessage}
                      onChange={() => handleSettingChange('notifyOnMessage')}
                    />
                  }
                  label="Message notifications"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifyOnGroupInvite}
                      onChange={() => handleSettingChange('notifyOnGroupInvite')}
                    />
                  }
                  label="Group invite notifications"
                />
              </Stack>
            </Box>

            <Divider />

            {/* Theme Settings */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Appearance
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.theme}
                  label="Theme"
                  onChange={(e) => handleThemeChange(e.target.value)}
                >
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="light">Light</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* Account */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Account
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-dim)', mb: 1.5 }}>
                Deactivating your account will disable access until reactivation support is added.
              </Typography>
              <Stack spacing={1.2}>
                <TextField
                  type="password"
                  label="Confirm password"
                  value={deactivatePassword}
                  onChange={(e) => setDeactivatePassword(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  onClick={handleDeactivateAccount}
                  disabled={deactivating}
                  sx={{
                    color: '#ffb3cc',
                    borderColor: 'rgba(255, 79, 216, 0.45)',
                    '&:hover': {
                      borderColor: '#ff4fd8',
                      backgroundColor: 'rgba(255, 79, 216, 0.14)',
                      boxShadow: '0 0 0 1px rgba(255, 79, 216, 0.3), 0 8px 20px rgba(122, 46, 255, 0.28)'
                    }
                  }}
                >
                  {deactivating ? 'Deactivating...' : 'Deactivate Account'}
                </Button>
              </Stack>
            </Box>

            <Divider />

            {/* Save Button */}
            <Button
              variant="contained"
              onClick={handleSaveSettings}
              disabled={saving}
              sx={{
                background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                color: '#fff',
                mt: 2
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
