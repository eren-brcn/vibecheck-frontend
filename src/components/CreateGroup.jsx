import { useState } from 'react';
import { TextField, MenuItem, Button, Box, Typography, FormControl, InputLabel, Select } from '@mui/material';
import api from '../api';

export default function CreateGroup({ onGroupCreated }) {
  const [newGroup, setNewGroup] = useState({
    name: '',
    category: 'rock', // Default value
    description: ''
  });
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const uploadData = new FormData();
    uploadData.append("image", selectedFile, selectedFile.name);

    try {
      setIsUploading(true);
      const response = await api.post("/upload", uploadData);
      setImageUrl(response.data.imageUrl);
      setIsUploading(false);
    } catch (error) {
      console.error("Error uploading file:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      setIsUploading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      // We combine the text data and the image URL here
      const groupData = { ...newGroup, imageUrl };
      await api.post('/groups', groupData);
      
      // Reset state and refresh
      setNewGroup({ name: '', category: 'rock', description: '' });
      setImageUrl('');
      onGroupCreated(); 
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <TextField
        fullWidth
        label="Group Name"
        value={newGroup.name}
        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
      />

      <FormControl fullWidth>
        <InputLabel>Genre</InputLabel>
        <Select
          value={newGroup.category}
          label="Genre"
          onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
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

      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>Group Photo:</Typography>
        <input type="file" onChange={handleFileUpload} />
        {isUploading && <Typography variant="caption" display="block">Uploading...</Typography>}
        {imageUrl && (
          <Box 
            component="img" 
            src={imageUrl} 
            sx={{ width: '100px', mt: 1, borderRadius: 1, display: 'block' }} 
          />
        )}
      </Box>

      <Button 
        variant="contained" 
        onClick={handleCreateGroup}
        disabled={isUploading || !newGroup.name}
      >
        {isUploading ? "Uploading Image..." : "Save Group"}
      </Button>
    </Box>
  );
}