import { useEffect, useState } from 'react';
import api from '../api';

function Dashboard() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups'); // Ensure this matches your backend route
      setGroups(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/groups/${id}`);
    setGroups(groups.filter((g) => g._id !== id)); // Updates UI instantly
  };

  const handleUpdate = async (id) => {
    const newName = prompt("Enter new name:");
    if (newName) {
      const res = await api.put(`/groups/${id}`, { name: newName });
      setGroups(groups.map((g) => (g._id === id ? res.data : g)));
    }
  };

  return (
    <div>
      <h1>My Groups Dashboard</h1>
      {groups.map((group) => (
        <div key={group._id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px' }}>
          <h3>{group.name}</h3>
          <button onClick={() => handleUpdate(group._id)}>Edit</button>
          <button onClick={() => handleDelete(group._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;