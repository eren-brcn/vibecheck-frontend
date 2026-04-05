import { useState, useEffect } from 'react';
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
  InputLabel
} from '@mui/material';
import api from '../api';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    allowFriendRequests: true,
    allowMessagesFromFriends: true,
    allowMessagesFromEveryone: false,
    notifyOnFriendRequest: true,
    notifyOnMessage: true,
    notifyOnGroupInvite: true,
    theme: 'dark'
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const [meRes, settingsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/users/settings')
        ]);

        setUser(meRes.data);
        setSettings((prev) => ({ ...prev, ...(settingsRes.data || {}) }));
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
    setStatusMessage('');
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setStatusMessage('');

      await api.put('/users/settings', settings);
      
      // Apply theme to document
      if (settings.theme === 'dark') {
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.style.colorScheme = 'light';
      }
      
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

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
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
                  <MenuItem value="light">Light (Coming soon)</MenuItem>
                </Select>
              </FormControl>
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
