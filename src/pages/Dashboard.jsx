import { useEffect, useState } from 'react';
import api from '../api';

function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState(""); // For the "Create" input

  // 1. Get groups when page loads
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch (err) {
      console.log("Error fetching data", err);
    }
  };

  // 2. Create a new group
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', { name: name });
      setName(""); // Clear the input box
      fetchGroups(); // Refresh the list
    } catch (err) {
      alert("Error creating group");
    }
  };

  // 3. Delete a group
  const handleDelete = async (id) => {
    try {
      await api.delete(`/groups/${id}`);
      fetchGroups(); // Refresh the list
    } catch (err) {
      console.log("Error deleting", err);
    }
  };

  // 4. Update a group name
  const handleUpdate = async (id) => {
    const newName = prompt("Enter new group name:");
    if (newName) {
      try {
        await api.put(`/groups/${id}, { name: newName }`);
        fetchGroups(); 
      } catch (err) {
        console.log("Error updating", err);
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>My Groups Dashboard</h1>

      {/* Simple Create Form */}
      <form onSubmit={handleCreate} style={{ marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder="Group Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <button type="submit">Add New Group</button>
      </form>

      {/* List of Groups */}
      {groups.length === 0 ? (
        <p>No groups found. Add one above!</p>
      ) : (
        groups.map((group) => (
          <div key={group._id} className="item-card" style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
            <h3>{group.name}</h3>
            <button onClick={() => handleUpdate(group._id)}>Edit</button>
            <button 
              onClick={() => handleDelete(group._id)} 
              style={{ backgroundColor: 'red', color: 'white', marginLeft: '10px' }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;