import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Avatar, List, ListItem,
  ListItemAvatar, ListItemText, Divider, Button, CircularProgress
} from '@mui/material';
import api from '../api';

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const primaryActionSx = {
    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
    color: '#fff',
    fontWeight: 700,
    '&:hover': {
      background: 'linear-gradient(90deg, var(--primary-strong), var(--accent))',
      boxShadow: '0 0 0 1px rgba(255, 79, 216, 0.35), 0 10px 24px rgba(122, 46, 255, 0.35)'
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

  const dangerActionSx = {
    color: '#ffb3cc',
    borderColor: 'rgba(255, 79, 216, 0.45)',
    '&:hover': {
      borderColor: '#ff4fd8',
      backgroundColor: 'rgba(255, 79, 216, 0.14)',
      boxShadow: '0 0 0 1px rgba(255, 79, 216, 0.3), 0 8px 20px rgba(122, 46, 255, 0.28)'
    }
  };

  const fetchGroup = async () => {
    const res = await api.get(`/groups/${groupId}`);
    setGroup(res.data);
  };

  const getOrganiserId = (organiser) => {
    if (!organiser) return null;
    if (typeof organiser === 'object') return String(organiser._id || organiser.id || '').trim();
    return String(organiser).trim();
  };

  useEffect(() => {
    Promise.all([api.get(`/groups/${groupId}`), api.get('/auth/me')])
      .then(([groupRes, meRes]) => {
        setGroup(groupRes.data);
        setCurrentUserId(String(meRes.data._id || meRes.data.id || '').trim());
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [groupId]);

  const handleKickMember = async (memberId) => {
    if (!window.confirm('Kick this member from the group?')) return;
    try {
      await api.put(`/groups/kick/${groupId}/${memberId}`);
      window.dispatchEvent(new Event('groups:updated'));
      await fetchGroup();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not kick member.');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (!group) return <Container sx={{ mt: 4 }}><Typography>Group not found.</Typography></Container>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2, ...neutralActionSx }}>← Back</Button>

      {group.imageUrl && (
        <Box component="img" src={group.imageUrl} alt={group.name}
          sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 2, mb: 2 }} />
      )}

      <Typography variant="h4" fontWeight="bold">{group.name}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textTransform: 'capitalize' }}>
        Genre: {group.category}
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate(`/chat/group/${groupId}`)}
        sx={{ mb: 3, ...primaryActionSx }}
      >
        Open Group Chat
      </Button>

      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        Members ({group.members?.length || 0})
      </Typography>

      <List>
        {group.members?.map((member) => {
          const id = member._id || member;
          const name = member.username || 'Unknown User';
          const memberImage = member && typeof member === 'object' ? member.imageUrl : null;
          const organiserId = getOrganiserId(group.organiser);
          const isOrganiser = organiserId && organiserId === String(id);
          const canKick = organiserId && currentUserId && organiserId === currentUserId && String(id) !== currentUserId;
          return (
            <ListItem key={id} sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar src={memberImage || undefined}>{name[0]?.toUpperCase()}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={name}
                secondary={isOrganiser ? 'Organiser' : 'Member'}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/chat/dm/${id}`)}
                  sx={neutralActionSx}
                >
                  Message
                </Button>
                {canKick && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleKickMember(id)}
                    sx={dangerActionSx}
                  >
                    Kick
                  </Button>
                )}
              </Box>
            </ListItem>
          );
        })}
      </List>
    </Container>
  );
}
