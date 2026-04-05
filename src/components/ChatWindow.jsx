import React, { useState } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, Typography } from '@mui/material';

const ChatWindow = ({
  messages,
  onSendMessage,
  onInputChange = () => {},
  isTyping = false,
  onLoadMore = () => {},
  hasMoreMessages = false,
  loadingMessages = false,
  currentUserId = null,
  onEditMessage = () => {},
  onDeleteMessage = () => {},
  onReactMessage = () => {}
}) => {
  const [text, setText] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');

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

  const handleTextChange = (e) => {
    setText(e.target.value);
    onInputChange(e.target.value);
  };

  return (
    <Box sx={{ p: 2, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 2 }}>
      <List sx={{ height: '70vh', overflowY: 'auto', borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.02)' }}>
        {hasMoreMessages && (
          <ListItem sx={{ justifyContent: 'center', pb: 2 }}>
            <Button
              size="small"
              onClick={onLoadMore}
              disabled={loadingMessages}
              variant="text"
            >
              {loadingMessages ? 'Loading...' : 'Load more messages'}
            </Button>
          </ListItem>
        )}
        {messages.map((msg, index) => (
          <ListItem key={index} sx={{ borderBottom: '1px solid rgba(187, 146, 255, 0.12)' }}>
            <Box sx={{ width: '100%' }}>
              <ListItemText
                primary={msg.author?.username || "Unknown"}
                secondary={editingMessageId === msg._id ? (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField
                      size="small"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      fullWidth
                    />
                    <Button
                      size="small"
                      onClick={() => {
                        onEditMessage(msg._id, editingText);
                        setEditingMessageId(null);
                        setEditingText('');
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditingMessageId(null);
                        setEditingText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <>
                    <Typography component="span" variant="body2" sx={{ color: 'var(--text-dim)' }}>
                      {msg.content}
                    </Typography>
                    {msg.editedAt && (
                      <Typography component="span" variant="caption" sx={{ color: 'var(--text-dim)', ml: 1 }}>
                        (edited)
                      </Typography>
                    )}
                  </>
                )}
                primaryTypographyProps={{ sx: { color: 'var(--text-main)', fontWeight: 600 } }}
                secondaryTypographyProps={{ component: 'div' }}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                <Button size="small" onClick={() => onReactMessage(msg._id, 'like')}>👍</Button>
                <Button size="small" onClick={() => onReactMessage(msg._id, 'fire')}>🔥</Button>
                <Button size="small" onClick={() => onReactMessage(msg._id, 'heart')}>❤️</Button>
                {String(msg.author?._id || msg.author) === String(currentUserId) && editingMessageId !== msg._id && (
                  <>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditingMessageId(msg._id);
                        setEditingText(msg.content || '');
                      }}
                    >
                      Edit
                    </Button>
                    <Button size="small" onClick={() => onDeleteMessage(msg._id)}>Delete</Button>
                  </>
                )}
                {Array.isArray(msg.reactions) && msg.reactions.length > 0 && (
                  <Typography variant="caption" sx={{ color: 'var(--text-dim)' }}>
                    {msg.reactions.map((r) => r.type === 'like' ? '👍' : r.type === 'fire' ? '🔥' : '❤️').join(' ')}
                  </Typography>
                )}
              </Box>
            </Box>
          </ListItem>
        ))}
        {isTyping && (
          <ListItem sx={{ borderBottom: '1px solid rgba(187, 146, 255, 0.12)' }}>
            <Typography variant="caption" sx={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
              User is typing...
            </Typography>
          </ListItem>
        )}
      </List>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          value={text}
          onChange={handleTextChange}
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