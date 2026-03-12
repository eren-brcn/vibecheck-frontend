import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Avatar, CircularProgress } from '@mui/material';
import api from '../api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Card>
        <CardContent sx={{ textAlign: 'center' }}>
          <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}>
            {(user.username || user.name || '?').charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h4">{user.username || user.name || 'User'}</Typography>
          <Typography variant="body1" color="text.secondary">{user.email || 'No email'}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}