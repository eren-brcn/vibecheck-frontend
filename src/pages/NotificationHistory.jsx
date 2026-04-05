import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import api from '../api';

const formatTime = (isoValue) => {
  if (!isoValue) return 'Unknown time';
  const date = new Date(isoValue);
  return date.toLocaleString();
};

export default function NotificationHistory() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    api.get('/users/notifications/history')
      .then((res) => setEntries(res.data || []))
      .catch(() => setEntries([]));
  }, []);

  const clearHistory = () => {
    api.delete('/users/notifications/history')
      .then(() => setEntries([]))
      .catch(() => {});
  };

  return (
    <Box sx={{ p: 3, maxWidth: 760, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Notification History</Typography>
        <Button variant="outlined" onClick={clearHistory}>Clear</Button>
      </Stack>

      {entries.length === 0 ? (
        <Card sx={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
          <CardContent>
            <Typography color="text.secondary">No history yet.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {entries.map((entry) => (
            <Card key={`${entry._id || entry.createdAt}-${entry.title}`} sx={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{entry.title || 'Notification'}</Typography>
                  <Chip label={entry.type || 'event'} size="small" />
                </Stack>
                <Typography variant="body2" color="text.secondary">{entry.body || ''}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {formatTime(entry.createdAt)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
