import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Grid, Container, Box } from '@mui/material';
import api from "../api";

export default function Discover() {
  const [allGroups, setAllGroups] = useState([]);
  const [joiningId, setJoiningId] = useState(null);
  const [joinedIds, setJoinedIds] = useState([]);

  const fetchGroups = () => {
    api.get("/groups")
      .then((res) => setAllGroups(res.data))
      .catch((err) => console.error("Error fetching groups for discovery:", err));
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleJoin = (id) => {
    setJoiningId(id);
    api.put(`/groups/join/${id}`)
      .then(() => {
        setJoinedIds((prev) => [...prev, id]);
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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Discover New Groups
      </Typography>

      <Grid container spacing={3}>
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