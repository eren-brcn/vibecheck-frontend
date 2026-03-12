import React, { useState } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText } from '@mui/material';

const ChatWindow = ({ messages, onSendMessage }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ p: 2, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 2 }}>
      <List sx={{ height: '70vh', overflowY: 'auto', borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.02)' }}>
        {messages.map((msg, index) => (
          <ListItem key={index} sx={{ borderBottom: '1px solid rgba(187, 146, 255, 0.12)' }}>
            <ListItemText 
              primary={msg.author?.username || "Unknown"} 
              secondary={msg.content} 
              primaryTypographyProps={{ sx: { color: 'var(--text-main)', fontWeight: 600 } }}
              secondaryTypographyProps={{ sx: { color: 'var(--text-dim)' } }}
            />
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'var(--text-main)',
              backgroundColor: 'var(--panel-soft)',
              '& fieldset': { borderColor: 'var(--border)' },
              '&:hover fieldset': { borderColor: 'var(--accent)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--accent)' }
            }
          }}
        />
        <Button
          onClick={handleSend}
          sx={{
            background: 'linear-gradient(90deg, var(--primary), var(--accent))',
            color: '#fff',
            fontWeight: 700,
            '&:hover': {
              background: 'linear-gradient(90deg, var(--primary-strong), var(--accent))',
              boxShadow: '0 0 0 1px rgba(255, 79, 216, 0.35), 0 10px 24px rgba(122, 46, 255, 0.35)'
            }
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatWindow;