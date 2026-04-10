import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import io from 'socket.io-client';
import ChatWindow from '../components/ChatWindow';
import DMSidebar from '../components/DMSidebar';
import api, { SERVER_URL } from '../api';


// Connect once outside the component to prevent multiple connections
const socket = io.connect(SERVER_URL);

const generateRoomId = (userAId, userBId) => {
  return [userAId, userBId].sort().join('_');
};

const Chat = () => {
  const { roomId, friendId, groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [friendProfile, setFriendProfile] = useState(null);
  const [friendProfileLoading, setFriendProfileLoading] = useState(false);
  const [friendError, setFriendError] = useState('');
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendMessage, setFriendMessage] = useState('');
  const [typingUserId, setTypingUserId] = useState(null);
  const [messagePage, setMessagePage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesPerPage = 30;

  const activeGroupId = groupId || null;
  const activeDmRoomId = !activeGroupId
    ? (roomId || (currentUser?._id && friendId ? generateRoomId(currentUser._id, friendId) : null))
    : null;
  const hasActiveConversation = Boolean(activeGroupId || activeDmRoomId);

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => setCurrentUser(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!friendId || activeGroupId) {
      setFriendProfile(null);
      setFriendError('');
      setFriendMessage('');
      return;
    }

    setFriendProfileLoading(true);
    setFriendError('');
    setFriendMessage('');

    api.get(`/users/${friendId}`)
      .then((res) => setFriendProfile(res.data))
      .catch((err) => {
        setFriendProfile(null);
        setFriendError(err.response?.data?.message || 'Could not load friend details.');
      })
      .finally(() => setFriendProfileLoading(false));
  }, [friendId, activeGroupId]);

  useEffect(() => {
    const joinedRoom = activeGroupId || activeDmRoomId;
    if (!joinedRoom) {
      return;
    }

    // 1. Join the room
    socket.emit('join_room', joinedRoom);

    // 2. Fetch message history from DB (first page)
    setLoadingMessages(true);
    api.get(`/messages/${joinedRoom}?limit=${messagesPerPage}&skip=0`)
      .then(res => {
        setMessages(res.data.messages || []);
        setHasMoreMessages(res.data.hasMore || false);
        setMessagePage(0);
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingMessages(false));

    // 3. Listen for new incoming messages
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // 4. Listen for typing indicator
    socket.on('typing', ({ userId }) => {
      setTypingUserId(userId);
      setTimeout(() => setTypingUserId(null), 2000);
    });

    // Cleanup on component unmount/room change
    return () => {
      socket.off('receive_message');
      socket.off('typing');
    };
  }, [activeGroupId, activeDmRoomId]);

  const sendMessage = (content) => {
    if (!currentUser?._id) {
      return;
    }

    const msgData = {
      content,
      author: currentUser._id,
      groupId: activeGroupId,
      recipientId: friendId || null,
      roomId: activeDmRoomId,
      fromUser: currentUser.username
    };

    socket.emit('send_message', msgData);
  };

  const loadMoreMessages = async () => {
    const joinedRoom = activeGroupId || activeDmRoomId;
    if (!joinedRoom || loadingMessages || !hasMoreMessages) {
      return;
    }

    try {
      setLoadingMessages(true);
      const nextPage = messagePage + 1;
      const skip = nextPage * messagesPerPage;
      const res = await api.get(`/messages/${joinedRoom}?limit=${messagesPerPage}&skip=${skip}`);
      setMessages((prev) => [...res.data.messages, ...prev]);
      setHasMoreMessages(res.data.hasMore || false);
      setMessagePage(nextPage);
    } catch (err) {
      console.error('Error loading more messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleInputChange = (value) => {
    if (activeDmRoomId) {
      socket.emit('typing', { roomId: activeDmRoomId });
    }
  };

  const handleEditMessage = async (messageId, content) => {
    try {
      const res = await api.put(`/messages/${messageId}`, { content });
      setMessages((prev) => prev.map((msg) => (String(msg._id) === String(messageId) ? res.data : msg)));
    } catch (err) {
      console.error('Edit message error:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) {
      return;
    }

    try {
      await api.delete(`/messages/${messageId}`);
      setMessages((prev) => prev.filter((msg) => String(msg._id) !== String(messageId)));
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  const handleReactMessage = async (messageId, type) => {
    try {
      const res = await api.post(`/messages/${messageId}/reactions`, { type });
      setMessages((prev) => prev.map((msg) => (String(msg._id) === String(messageId) ? res.data : msg)));
    } catch (err) {
      console.error('React message error:', err);
    }
  };

  const handleAddFriend = async () => {
    if (!friendProfile?._id) {
      return;
    }

    try {
      setAddingFriend(true);
      setFriendError('');
      setFriendMessage('');
      await api.post(`/users/${friendProfile._id}/friend`);
      setFriendProfile((prev) => ({ ...prev, friendRequestStatus: 'sent' }));
      setFriendMessage('Friend request sent.');
    } catch (err) {
      setFriendError(err.response?.data?.message || 'Could not send friend request.');
    } finally {
      setAddingFriend(false);
    }
  };

  const renderFriendStatus = () => {
    if (!friendId || activeGroupId) {
      return null;
    }

    if (friendProfileLoading) {
      return (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'var(--text-dim)' }}>
            Loading conversation details...
          </Typography>
        </Box>
      );
    }

    if (!friendProfile) {
      return friendError ? <Alert severity="error" sx={{ mb: 2 }}>{friendError}</Alert> : null;
    }

    const status = friendProfile.friendRequestStatus;
    const isAlreadyFriend = friendProfile.isFriend || status === 'friends';
    const canSendRequest = status === 'none';

    return (
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ color: 'var(--text-main)', fontWeight: 700 }}>
          Chat with {friendProfile.username}
        </Typography>

        {isAlreadyFriend && <Alert severity="success">You are friends.</Alert>}
        {status === 'sent' && <Alert severity="info">Friend request already sent.</Alert>}
        {status === 'received' && <Alert severity="info">This user already requested you. Accept it from notifications.</Alert>}
        {friendError && <Alert severity="error">{friendError}</Alert>}
        {friendMessage && <Alert severity="success">{friendMessage}</Alert>}

        {canSendRequest && (
          <Box>
            <Button
              variant="contained"
              disabled={addingFriend}
              onClick={handleAddFriend}
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
              {addingFriend ? 'Sending...' : 'Add Friend'}
            </Button>
          </Box>
        )}
      </Stack>
    );
  };

  return (
    <Stack direction="row" sx={{ height: '100%', gap: 2, p: 2 }}>
      <DMSidebar />
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        {renderFriendStatus()}
        {hasActiveConversation ? (
          <ChatWindow 
            messages={messages} 
            onSendMessage={sendMessage} 
            onInputChange={handleInputChange} 
            isTyping={Boolean(typingUserId && typingUserId !== currentUser?._id)}
            onLoadMore={loadMoreMessages}
            hasMoreMessages={hasMoreMessages}
            loadingMessages={loadingMessages}
            currentUserId={currentUser?._id}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onReactMessage={handleReactMessage}
          />
        ) : (
          <Box sx={{ p: 4, border: '1px solid var(--border)', borderRadius: 2, background: 'var(--panel)' }}>
            <Typography variant="h6" sx={{ color: 'var(--text-main)', mb: 1, fontWeight: 700 }}>
              Pick a conversation
            </Typography>
            <Typography sx={{ color: 'var(--text-dim)' }}>
              Select a friend from the sidebar or open a group chat to start messaging.
            </Typography>
          </Box>
        )}
      </Stack>
    </Stack>
  );
};

export default Chat;