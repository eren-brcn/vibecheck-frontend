import { useState, useEffect } from 'react';
import { 
  Typography, Button, Grid, Container, Card, CardContent, Box, Avatar,
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
        } catch { /* ignore */ }
      });
  }, []);

  const getOrganiserId = (organiser) => {
    if (!organiser) return null;
    if (typeof organiser === 'object') return String(organiser._id || organiser.id || '').trim();
    return String(organiser).trim();
  };

  const [myGroups, setMyGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('rock');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const primaryActionSx = {
    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
    color: '#fff',
    fontWeight: 700,
    '&:hover': {
      background: 'linear-gradient(90deg, var(--primary-strong), var(--accent))',
      boxShadow: '0 0 0 1px rgba(255, 79, 216, 0.35), 0 10px 24px rgba(122, 46, 255, 0.35)'
    }
  };

  const dangerActionSx = {
    color: '#ffb3cc',
    borderColor: 'rgba(255, 79, 216, 0.45)',
    '&:hover': {
      borderColor: '#ff4fd8',
      backgroundColor: 'rgba(255, 79, 216, 0.14)',
      boxShadow: '0 0 0 1px rgba(255, 79, 216, 0.3), 0 8px 20px rgba(122, 46, 255, 0.28)'
    }
  };

  const neutralActionSx = {
    color: 'var(--text-main)',
    borderColor: 'var(--border)',
    '&:hover': {
      borderColor: 'var(--accent)',
      backgroundColor: 'rgba(155, 92, 255, 0.12)',
      boxShadow: '0 0 0 1px rgba(255, 79, 216, 0.22), 0 8px 18px rgba(122, 46, 255, 0.26)'
    }
  };

  const formFieldSx = {
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
    }
  };

  const fetchMyGroups = () => {
    api.get("/groups/my-groups")
      .then((res) => setMyGroups(res.data))
      .catch((err) => console.error("Error fetching my groups:", err));
  };

  // Re-fetch groups whenever currentUserId resolves so organiser checks are accurate
  useEffect(() => { fetchMyGroups(); }, [currentUserId]);

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
    window.dispatchEvent(new Event("groups:updated"));
    fetchMyGroups();
  };

  const handleKick = async (groupId, userId) => {
    await api.put(`/groups/kick/${groupId}/${userId}`);
    window.dispatchEvent(new Event("groups:updated"));
    fetchMyGroups();
  };

  const handleLeave = async (groupId) => {
    await api.put(`/groups/leave/${groupId}`);
    window.dispatchEvent(new Event("groups:updated"));
    fetchMyGroups();
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm('Delete this group? This cannot be undone.')) return;
    try {
      await api.delete(`/groups/${groupId}`);
      window.dispatchEvent(new Event("groups:updated"));
      fetchMyGroups();
    } catch (err) {
      console.error('Error deleting group:', err);
      window.alert('Could not delete the group. Please try again.');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete ALL your groups? This cannot be undone.')) return;
    try {
      await api.delete('/groups/mine/all');
      window.dispatchEvent(new Event("groups:updated"));
      fetchMyGroups();
    } catch (err) {
      console.error('Error deleting all groups:', err);
      window.alert('Could not delete all groups. Please try again.');
    }
  };

  return (
    <Container maxWidth={false} sx={{ mt: 0, px: 0, pb: 4, position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 120px)' }}>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(180deg, rgba(26, 2, 29, 0.24) 0%, rgba(18, 0, 21, 0.42) 100%), url(/pexels-rahulp9800-3052360.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.68,
          filter: 'none',
          pointerEvents: 'none'
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: { xs: 2, md: 4 }, pt: 3, mb: 3, position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" fontWeight="bold">My Groups</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handleDeleteAll} sx={dangerActionSx}>Delete All</Button>
          <Button variant="contained" onClick={() => setOpen(true)} sx={primaryActionSx}>+ Add Group</Button>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 } }}>
      <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
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
                    <Button size="small" variant="outlined" onClick={() => handleDelete(group._id)} sx={dangerActionSx}>Delete Group</Button>
                  </Box>
                )}
                <Typography variant="h6" sx={{ color: 'var(--text-main)', fontWeight: 700 }}>{group.name}</Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-dim)' }}>Genre: {group.category}</Typography>
                
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ color: 'var(--text-main)' }}>Members:</Typography>
                
                
                {group.members && group.members.map((member) => {
                  // member can be a populated object {_id, name} or a plain ID string
                  const memberId = member && typeof member === 'object' ? String(member._id) : String(member);
                  const memberName = member && typeof member === 'object' ? (member.username || member.name || member.email || 'Unknown User') : memberId;
                  const memberImage = member && typeof member === 'object' ? member.imageUrl : null;
                  return (
                    <Box key={memberId} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={memberImage || undefined} sx={{ width: 24, height: 24 }}>
                          {memberName[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ color: 'var(--text-main)' }}>{memberName}</Typography>
                      </Box>
                      {organiserId === currentUserId && memberId !== currentUserId && (
                        <Button size="small" variant="outlined" onClick={() => handleKick(group._id, memberId)} sx={dangerActionSx}>Kick</Button>
                      )}
                      {memberId === currentUserId && memberId !== organiserId && (
                        <Button size="small" variant="outlined" onClick={() => handleLeave(group._id)} sx={neutralActionSx}>Leave</Button>
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
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Create a New Group</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Group Name" fullWidth value={newName} onChange={(e) => setNewName(e.target.value)} sx={formFieldSx} />
          <FormControl fullWidth sx={formFieldSx}>
            <InputLabel>Genre</InputLabel>
            <Select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              MenuProps={{
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
              }}
            >
              <MenuItem value="rock">Rock</MenuItem>
              <MenuItem value="pop">Pop</MenuItem>
              <MenuItem value="hip-hop">Hip-Hop</MenuItem>
              <MenuItem value="jazz">Jazz</MenuItem>
              <MenuItem value="classical">Classical</MenuItem>
              <MenuItem value="electronic">Electronic</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <input type="file" onChange={handleFileUpload} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateGroup} disabled={isUploading} sx={primaryActionSx}>Save Group</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}