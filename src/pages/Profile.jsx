import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Avatar, CircularProgress, Button } from '@mui/material';
import api from '../api';

export default function Profile() {
  const [user, setUser] = useState(null);
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
    } catch (error) {
      console.error('Photo upload error:', error);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Card sx={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Avatar src={user.imageUrl || undefined} sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}>
            {(user.username || user.name || '?').charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h4">{user.username || user.name || 'User'}</Typography>
          <Typography variant="body1" color="text.secondary">{user.email || 'No email'}</Typography>
          <Button component="label" variant="contained" sx={{ mt: 2, ...primaryActionSx }} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Photo'}
            <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}