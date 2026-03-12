import { useState, useEffect } from 'react';
import { 
  Typography, Button, Grid, Container, Card, CardContent, Box, 
  Dialog, DialogTitle, DialogContent, TextField, MenuItem, 
  DialogActions, FormControl, InputLabel, Select, Divider 
} from '@mui/material';
import api from "../api";

export default function Dashboard() {
  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch the current user's ID from the API so we don't rely on JWT key names
  useEffect(() => {
    api.get('/auth/me')
      .then((res) => {
        const id = res.data._id || res.data.id || res.data.userId || null;
        setCurrentUserId(id ? String(id) : null);
      })
      .catch(() => {
        // Fallback: decode JWT manually
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const raw = payload._id || payload.id || payload.sub || payload.userId || null;
            setCurrentUserId(raw ? String(raw) : null);
          }
        } catch (e) { /* ignore */ }
      });
  }, []);

  const getOrganiserId = (organiser) => {
    if (!organiser) return null;
    if (typeof organiser === 'object') return String(organiser._id || organiser.id || '');
    return String(organiser);
  };

  const [myGroups, setMyGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('rock');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchMyGroups = () => {
    api.get("/groups/my-groups")
      .then((res) => {
        console.log('[Dashboard] currentUserId:', currentUserId);
        console.log('[Dashboard] groups from API:', res.data);
        setMyGroups(res.data);
      })
      .catch((err) => console.error("Error fetching my groups:", err));
  };

  useEffect(() => { fetchMyGroups(); }, []);

  const handleFileUpload = async (e) => {
    const uploadData = new FormData();
    uploadData.append("image", e.target.files[0]);
    try {
      setIsUploading(true);
      const response = await api.post("/upload", uploadData);
      setImageUrl(response.data.imageUrl);
      setIsUploading(false);
    } catch (error) { console.error("Upload error:", error); setIsUploading(false); }
  };

  const handleCreateGroup = async () => {
    await api.post('/groups', { name: newName, category: newCategory, imageUrl });
    setOpen(false);
    fetchMyGroups();
  };

  const handleKick = async (groupId, userId) => {
    await api.put(`/groups/kick/${groupId}/${userId}`);
    fetchMyGroups();
  };

  const handleLeave = async (groupId) => {
    await api.put(`/groups/leave/${groupId}`);
    fetchMyGroups();
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm('Delete this group? This cannot be undone.')) return;
    try {
      await api.delete(`/groups/${groupId}`);
      fetchMyGroups();
    } catch (err) {
      console.error('Error deleting group:', err);
      window.alert('Could not delete the group. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">My Groups</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>+ Add Group</Button>
      </Box>

      
      <Grid container spacing={3}>
        {myGroups.map((group) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={group._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {(() => {
                const organiserId = getOrganiserId(group.organiser || group.organizer);

                return (
                  <>
              {group.imageUrl ? (
                <Box component="img" sx={{ height: 140, width: '100%', objectFit: 'cover' }} src={group.imageUrl} />
              ) : (
                <Box sx={{ height: 140, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption">No Photo</Typography>
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Temporary debug — remove once buttons are visible */}
                <Typography variant="caption" sx={{ color: 'grey.500', fontSize: '10px', display: 'block', mb: 0.5 }}>
                  org: {organiserId} | me: {currentUserId}
                </Typography>
                {organiserId === currentUserId && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <Button size="small" color="error" onClick={() => handleDelete(group._id)}>Delete Group</Button>
                  </Box>
                )}
                <Typography variant="h6">{group.name}</Typography>
                <Typography variant="body2" color="text.secondary">Genre: {group.category}</Typography>
                
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">Members:</Typography>
                
                
                {group.members && group.members.map((member) => {
                  // member can be a populated object {_id, name} or a plain ID string
                  const memberId = member && typeof member === 'object' ? String(member._id) : String(member);
                  const memberName = member && typeof member === 'object' ? (member.name || 'Unknown User') : memberId;
                  return (
                    <Box key={memberId} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">{memberName}</Typography>
                      {organiserId === currentUserId && memberId !== currentUserId && (
                        <Button size="small" color="error" onClick={() => handleKick(group._id, memberId)}>Kick</Button>
                      )}
                      {memberId === currentUserId && memberId !== organiserId && (
                        <Button size="small" onClick={() => handleLeave(group._id)}>Leave</Button>
                      )}
                    </Box>
                  );
                })}
              </CardContent>
                  </>
                );
              })()}
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Create a New Group</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Group Name" fullWidth value={newName} onChange={(e) => setNewName(e.target.value)} />
          <FormControl fullWidth>
            <InputLabel>Genre</InputLabel>
            <Select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              <MenuItem value="rock">Rock</MenuItem>
              <MenuItem value="pop">Pop</MenuItem>
              <MenuItem value="hip-hop">Hip-Hop</MenuItem>
              <MenuItem value="jazz">Jazz</MenuItem>
            </Select>
          </FormControl>
          <input type="file" onChange={handleFileUpload} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateGroup} disabled={isUploading}>Save Group</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}