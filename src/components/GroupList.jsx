import { useEffect, useState } from 'react';
import api from '../api';

function GroupList() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    // This calls your /api/groups route
    api.get('/groups')
      .then(res => setGroups(res.data))
      .catch(err => console.error("Error fetching groups:", err));
  }, []);

  return (
    <div>
      <h2>Your Groups</h2>
      {groups.map(group => (
        <div key={group._id} className="group-card">
          <h3>{group.name}</h3>
            <p>{group.description}</p>
        </div>
      ))}
    </div>
  );
}
export default GroupList;