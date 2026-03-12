import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { List, ListItemButton, ListItemText, Typography, Divider } from "@mui/material";
import api from "../../api";

export default function Sidebar() {
  const [groups, setGroups] = useState([]);

  const fetchMyGroups = () => {
    api.get("/groups/my-groups")
      .then((res) => setGroups(res.data))
      .catch((err) => console.error("Sidebar error:", err));
  };

  useEffect(() => {
    fetchMyGroups();

    const handleGroupsUpdated = () => {
      fetchMyGroups();
    };

    window.addEventListener("groups:updated", handleGroupsUpdated);

    return () => {
      window.removeEventListener("groups:updated", handleGroupsUpdated);
    };
  }, []);

  return (
    <aside className="sidebar">
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>My Groups</Typography>
      <Divider sx={{ mb: 1 }} />
      <List dense disablePadding>
        {groups.map((group) => (
          <ListItemButton
            key={group._id}
            component={Link}
            to={`/group-details/${group._id}`}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              color: 'var(--text-main)',
              border: '1px solid transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(155, 92, 255, 0.16)',
                borderColor: 'var(--border)',
                boxShadow: '0 0 0 1px rgba(255, 79, 216, 0.25), 0 8px 18px rgba(122, 46, 255, 0.28)'
              }
            }}
          >
            <ListItemText primary={group.name} secondary={group.category} />
          </ListItemButton>
        ))}
      </List>
    </aside>
  );
}