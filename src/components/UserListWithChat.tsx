import React, { useEffect, useState, useCallback } from 'react';

interface User {
  username: string;
  name: string;
  lastname: string;
  email: string;
  userId: string;
}

interface Props {
  currentUserId: string;
  onUserSelect: (user: User) => void;
}

const UserListWithChat: React.FC<Props> = ({ currentUserId, onUserSelect }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('https://xwkq8o8xi9.execute-api.us-east-2.amazonaws.com/dev/');
      const data = await response.json();
      const parsedBody = JSON.parse(data.body); 
      const users: User[] = parsedBody.users || [];
      console.log('Usuarios conectados:', users);
      setUsers(users.filter(user => user.userId !== currentUserId));
    } catch (error) {
      console.error('Error al obtener usuarios conectados:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Cargar usuarios una vez al iniciar
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div>
      <h3>Usuarios en línea</h3>
      <button onClick={fetchUsers} disabled={loading}>
        {loading ? 'Actualizando...' : 'Actualizar'}
      </button>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {users.map(user => (
          <li
            key={user.userId}
            style={{
              padding: '0.5rem',
              borderBottom: '1px solid #ddd',
              cursor: 'pointer',
            }}
            onClick={() => onUserSelect(user)}
          >
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserListWithChat;
