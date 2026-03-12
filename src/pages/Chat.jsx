import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import ChatWindow from '../components/ChatWindow';
import api from '../api';

const SERVER_URL = (import.meta.env.VITE_SERVER_URL || 'http://localhost:5005').replace(/\/$/, '');

// Connect once outside the component to prevent multiple connections
const socket = io.connect(SERVER_URL);

const generateRoomId = (userAId, userBId) => {
  return [userAId, userBId].sort().join('_');
};

const Chat = () => {
  const { roomId, friendId, groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const activeGroupId = groupId || null;
  const activeDmRoomId = !activeGroupId
    ? (roomId || (currentUser?._id && friendId ? generateRoomId(currentUser._id, friendId) : null))
    : null;

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => setCurrentUser(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const joinedRoom = activeGroupId || activeDmRoomId;
    if (!joinedRoom) {
      return;
    }

    // 1. Join the room
    socket.emit('join_room', joinedRoom);

    // 2. Fetch history from DB
    api.get(`/messages/${joinedRoom}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));

    // 3. Listen for new incoming messages
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup on component unmount/room change
    return () => socket.off('receive_message');
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
      roomId: activeDmRoomId
    };

    socket.emit('send_message', msgData);
  };

  return <ChatWindow messages={messages} onSendMessage={sendMessage} />;
};

export default Chat;