import { useState } from 'react';
import {
  Container, Typography, Box, TextField, MenuItem,
  Button, Card, CardContent, Grid, CircularProgress
} from '@mui/material';
import api from '../api';

const COUNTRIES = [
  { code: 'TR', label: 'Türkiye' },
  { code: 'US', label: 'USA' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
];

export default function Concerts() {
  const [country, setCountry] = useState('TR');
  const [city, setCity] = useState('');
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchFieldSx = {
    minWidth: 200,
    '& .MuiInputLabel-root': {
      color: 'var(--text-dim)'
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: 'var(--text-main)'
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'var(--panel-soft)',
      color: 'var(--text-main)',
      '& fieldset': {
        borderColor: 'var(--border)'
      },
      '&:hover fieldset': {
        borderColor: 'var(--accent)'
      },
      '&.Mui-focused fieldset': {
        borderColor: 'var(--accent)'
      }
    },
    '& .MuiSvgIcon-root': {
      color: 'var(--text-main)'
    },
    '& .MuiInputBase-input::placeholder': {
      color: 'var(--text-dim)',
      opacity: 1
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/concerts/search?country=${country}&city=${city}`);
      setConcerts(res.data);
    } catch (err) {
      console.error('Concert search error:', err);
      setConcerts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Find Concerts</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          select label="Country" value={country}
          onChange={(e) => setCountry(e.target.value)}
          sx={{ ...searchFieldSx, minWidth: 160 }}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  bgcolor: 'var(--panel)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border)',
                  '& .MuiMenuItem-root.Mui-selected': {
                    backgroundColor: 'rgba(255, 46, 168, 0.2)'
                  },
                  '& .MuiMenuItem-root.Mui-selected:hover': {
                    backgroundColor: 'rgba(255, 46, 168, 0.3)'
                  },
                  '& .MuiMenuItem-root:hover': {
                    backgroundColor: 'rgba(139, 45, 255, 0.2)'
                  }
                }
              }
            }
          }}
        >
          {COUNTRIES.map((c) => (
            <MenuItem key={c.code} value={c.code}>{c.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="City (optional)" value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={searchFieldSx}
        />
        <Button variant="contained" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </Box>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}

      {!loading && searched && concerts.length === 0 && (
        <Typography color="text.secondary">No concerts found. Try a different city or country.</Typography>
      )}

      <Grid container spacing={3}>
        {concerts.map((concert) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={concert.id}>
            <Card sx={{ height: '100%' }}>
              {concert.images?.[0]?.url && (
                <Box component="img" src={concert.images[0].url} alt={concert.name}
                  sx={{ width: '100%', height: 160, objectFit: 'cover' }} />
              )}
              <CardContent>
                <Typography variant="h6" gutterBottom>{concert.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  📅 {concert.dates?.start?.localDate || 'Date TBD'}
                </Typography>
                {concert._embedded?.venues?.[0] && (
                  <Typography variant="body2" color="text.secondary">
                    📍 {concert._embedded.venues[0].name}, {concert._embedded.venues[0].city?.name}
                  </Typography>
                )}
                {concert.url && (
                  <Button size="small" href={concert.url} target="_blank" rel="noopener noreferrer" sx={{ mt: 1 }}>
                    Get Tickets →
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
