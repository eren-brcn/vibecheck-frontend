import { useState, useEffect } from "react";
import api from "../../api";

export default function Sidebar() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    api.get("/groups/my-groups")
      .then((res) => setGroups(res.data))
      .catch((err) => console.error("Sidebar error:", err));
  }, []);

  return (
    <aside className="sidebar">
      <h3>My Groups</h3>
      <ul>
        {groups.map((group) => (
          <li key={group._id}>{group.name}</li>
        ))}
      </ul>
    </aside>
  );
}