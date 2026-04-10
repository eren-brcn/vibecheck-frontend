import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

export default function About() {
  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Card sx={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
            About VibeCheck
          </Typography>
          <Stack spacing={1.5}>
            <Typography sx={{ color: 'var(--text-dim)' }}>
              VibeCheck helps music fans discover concerts, build communities, and chat with friends in real time.
            </Typography>
            <Typography sx={{ color: 'var(--text-dim)' }}>
              You can create public or private groups, send direct messages, and follow your favorite concert events.
            </Typography>
            <Typography sx={{ color: 'var(--text-dim)' }}>
              Our goal is simple: make it easier to find your people and enjoy live music together.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
