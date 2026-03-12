import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Grid, Container, Box } from '@mui/material';
import api from "../api";

export default function Discover() {
  const [allGroups, setAllGroups] = useState([]);
  const [joiningId, setJoiningId] = useState(null);
  const [joinedIds, setJoinedIds] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchGroups = () => {
    api.get("/groups")
      .then((res) => setAllGroups(res.data))
      .catch((err) => console.error("Error fetching groups for discovery:", err));
  };

  useEffect(() => {
    fetchGroups();
    api.get('/auth/me')
      .then((res) => setCurrentUserId(String(res.data._id || res.data.id || '').trim()))
      .catch(() => {});
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this group? This cannot be undone.')) return;
    setDeletingId(id);
    api.delete(`/groups/${id}`)
      .then(() => {
        window.dispatchEvent(new Event('groups:updated'));
        fetchGroups();
      })
      .catch((err) => alert(err.response?.data?.message || 'Could not delete group.'))
      .finally(() => setDeletingId(null));
  };

  const handleJoin = (id) => {
    setJoiningId(id);
    api.put(`/groups/join/${id}`)
      .then(() => {
        setJoinedIds((prev) => [...prev, id]);
        window.dispatchEvent(new Event("groups:updated"));
        setJoiningId(null);
        fetchGroups();
      })
      .catch((err) => {
        console.error("Error joining group:", err);
        setJoiningId(null);
        alert(err.response?.data?.message || "Could not join the group. Please try again.");
      });
  };

  return (
    <Container maxWidth={false} sx={{ mt: 0, px: 0, position: 'relative', overflow: 'hidden', pb: 4, minHeight: 'calc(100vh - 120px)' }}>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(180deg, rgba(26, 2, 29, 0.22) 0%, rgba(18, 0, 21, 0.4) 100%), url(/pexels-rahulp9800-3052360.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.68,
          filter: 'none',
          pointerEvents: 'none'
        }}
      />
      <Typography variant="h4" sx={{ mb: 4, pt: 3, px: { xs: 2, md: 4 }, fontWeight: 'bold', position: 'relative', zIndex: 1 }}>
        Discover New Groups
      </Typography>

      <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1, px: { xs: 2, md: 4 } }}>
        {allGroups.map((group) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={group._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              
              {/* Image Section - Displays the Cloudinary URL from your new model field */}
              {group.imageUrl ? (
                <Box
                  component="img"
                  sx={{
                    height: 180,
                    width: '100%',
                    objectFit: 'cover',
                  }}
                  alt={group.name}
                  src={group.imageUrl}
                />
              ) : (
                <Box
                  sx={{
                    height: 180,
                    width: '100%',
                    backgroundColor: 'grey.300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography color="text.secondary">No Image Available</Typography>
                </Box>
              )}

              <CardContent sx={{ flexGrow: 1 }}>
                {(() => {
                  const organiserId = group.organiser
                    ? String(typeof group.organiser === 'object' ? group.organiser._id : group.organiser).trim()
                    : null;
                  const isOwner = organiserId && currentUserId && organiserId === currentUserId;
                  return isOwner ? (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={deletingId === group._id}
                        onClick={() => handleDelete(group._id)}
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
                        {deletingId === group._id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </Box>
                  ) : null;
                })()}
                <Typography variant="h5" gutterBottom>
                  {group.name}
                </Typography>
                
                <Typography color="text.secondary" sx={{ mb: 2, textTransform: 'capitalize' }}>
                  Genre: {group.category}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Members: {group.members ? group.members.length : 0}
                </Typography>

                <Button 
                  variant={joinedIds.includes(group._id) ? "outlined" : "contained"}
                  color={joinedIds.includes(group._id) ? "success" : "primary"}
                  fullWidth 
                  disabled={joiningId === group._id}
                  sx={joinedIds.includes(group._id)
                    ? {
                        borderColor: 'var(--border)',
                        color: 'var(--text-main)',
                        '&:hover': {
                          borderColor: 'var(--accent)',
                          backgroundColor: 'rgba(155, 92, 255, 0.12)'
                        }
                      }
                    : {
                        background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                        color: '#fff',
                        fontWeight: 700,
                        '&:hover': {
                          background: 'linear-gradient(90deg, var(--primary-strong), var(--accent))',
                          boxShadow: '0 0 0 1px rgba(255, 79, 216, 0.35), 0 10px 24px rgba(122, 46, 255, 0.35)'
                        }
                      }}
                  onClick={() => handleJoin(group._id)}
                >
                  {joiningId === group._id ? 'Joining...' : joinedIds.includes(group._id) ? '✓ Joined' : 'Join Group'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}