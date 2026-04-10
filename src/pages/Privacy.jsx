import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

export default function Privacy() {
  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Card sx={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
            Privacy Policy
          </Typography>
          <Stack spacing={1.2}>
            <Typography sx={{ color: 'var(--text-dim)' }}>
              VibeCheck stores account, profile, and app activity data needed to provide core features.
            </Typography>
            <Typography sx={{ color: 'var(--text-dim)' }}>
              We use your data to support login, messaging, social features, and personalization.
            </Typography>
            <Typography sx={{ color: 'var(--text-dim)' }}>
              We do not sell personal data. Access is limited to system operations and security needs.
            </Typography>
            <Typography sx={{ color: 'var(--text-dim)' }}>
              You can manage profile details and account settings from within the app at any time.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
