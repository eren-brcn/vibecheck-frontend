function CreateGroup({ onGroupCreated }) {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/groups', { name });
    onGroupCreated(); // Refresh the list
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="New Group Name" onChange={(e) => setName(e.target.value)} />
      <button type="submit">Create Group</button>
    </form>
  );
}