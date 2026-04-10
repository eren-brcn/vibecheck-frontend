import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { List, ListItemButton, Typography, Stack } from "@mui/material";
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import api from "../../api";

export default function Sidebar() {
  const [groups, setGroups] = useState([]);
  const location = useLocation();

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
      <div className="sidebar-header">
        <LibraryMusicIcon sx={{ fontSize: 15, color: 'var(--primary)', opacity: 0.85, flexShrink: 0 }} />
        <span className="sidebar-title">My Groups</span>
      </div>

      <List dense disablePadding sx={{ flex: 1 }}>
        {groups.length === 0 && (
          <Typography variant="caption" sx={{ color: 'var(--text-dim)', px: 1, display: 'block', mt: 0.5, lineHeight: 1.5 }}>
            No groups yet.
          </Typography>
        )}
        {groups.map((group) => {
          const isActive = location.pathname === `/group-details/${group._id}`;
          return (
            <ListItemButton
              key={group._id}
              component={Link}
              to={`/group-details/${group._id}`}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                py: 0.85,
                color: 'var(--text-main)',
                border: `1px solid ${isActive ? 'rgba(255, 79, 216, 0.4)' : 'transparent'}`,
                background: isActive ? 'rgba(139, 45, 255, 0.16)' : 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(155, 45, 192, 0.15)',
                  borderColor: 'rgba(255, 79, 216, 0.28)',
                  boxShadow: '0 0 0 1px rgba(255, 79, 216, 0.12), 0 5px 14px rgba(122, 46, 255, 0.2)',
                  transform: 'translateX(2px)',
                }
              }}
            >
              <Stack sx={{ width: '100%', minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: isActive ? '#ff4fd8' : 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {group.name}
                </Typography>
                {group.category && (
                  <span className="sidebar-category-badge">{group.category}</span>
                )}
              </Stack>
            </ListItemButton>
          );
        })}
      </List>

      <Link to="/dashboard" className="sidebar-view-all">
        View all groups →
      </Link>
    </aside>
  );
}