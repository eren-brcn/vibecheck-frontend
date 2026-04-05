import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Avatar,
  CircularProgress,
  TextField,
  InputAdornment,
  Divider,
  Paper,
  Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api from '../api';
import { initSocket } from '../socket';

export default function DMSidebar() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const socket = initSocket();
    const handleNewMessage = ({ senderId, recipientId, content, fromUser }) => {
      loadConversations();
    };

    socket.on('message:new', handleNewMessage);
    return () => socket.off('message:new', handleNewMessage);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = conversations.filter((conv) =>
        (conv.otherUser.username || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/messages/recent/dms');
      setConversations(res.data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (otherUserId) => {
    // Mark messages as read when opening conversation
    const currentUser = (await api.get('/auth/me')).data;
    const roomId = [currentUser._id, otherUserId].sort().join('_');
    try {
      await api.put(`/messages/mark-read/${roomId}`);
      loadConversations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
    navigate(`/chat/dm/${otherUserId}`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 1,
        p: 2,
        maxWidth: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        Direct Messages
      </Typography>

      <TextField
        placeholder="Search..."
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          )
        }}
        sx={{ mb: 1.5 }}
      />

      {filteredConversations.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          {conversations.length === 0 ? 'No conversations yet' : 'No matches found'}
        </Typography>
      ) : (
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {filteredConversations.map((conversation, index) => (
            <Box key={conversation.otherUser._id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSelectConversation(conversation.otherUser._id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ width: '100%' }}>
                    <Badge
                      badgeContent={conversation.unreadCount || 0}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#ff4f8c',
                          color: '#ff4f8c'
                        }
                      }}
                    >
                      <Avatar
                        src={conversation.otherUser.imageUrl || undefined}
                        sx={{ width: 40, height: 40, flexShrink: 0 }}
                      >
                        {(conversation.otherUser.username || '?').charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                    <Stack sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {conversation.otherUser.username || 'User'}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block'
                        }}
                      >
                        {conversation.lastMessageFrom}: {conversation.lastMessage}
                      </Typography>
                      <Typography variant="caption" sx={{ mt: 0.3, color: 'text.disabled' }}>
                        {new Date(conversation.lastMessageTime).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Stack>
                </ListItemButton>
              </ListItem>
              {index < filteredConversations.length - 1 && (
                <Divider sx={{ my: 0.5 }} />
              )}
            </Box>
          ))}
        </List>
      )}
    </Paper>
  );
}
