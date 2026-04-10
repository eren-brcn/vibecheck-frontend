import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

export default function Terms() {
  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Card sx={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
            Terms of Service
          </Typography>
          <Stack spacing={1.2}>
            <Typography sx={{ color: 'var(--text-dim)' }}>
              By using VibeCheck, you agree to use the platform respectfully and lawfully.
            </Typography>
            <Typography sx={{ color: 'var(--text-dim)' }}>
              You are responsible for your account activity and the content you share.
            </Typography>
            <Typography sx={{ color: 'var(--text-dim)' }}>
              We may restrict or remove accounts that abuse the platform or violate community standards.
            </Typography>
            <Typography sx={{ color: 'var(--text-dim)' }}>
              These terms may be updated over time. Continued use means you accept the latest version.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
