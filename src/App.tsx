import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "react-oidc-context";
import UserListWithChat from './components/UserListWithChat';
import { decodeJwt } from 'jose';

interface User {
  username: string;
  name: string;
  lastname: string;
  email: string;
  userId: string;
}

interface JwtPayload {
  sub: string;
  email?: string;
  username?: string;
  [key: string]: any;
}

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [input, setInput] = useState('');
  type Message = { text: string; from: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);


  const auth = useAuth();

  const userData = auth.user?.access_token ? decodeJwt(auth.user.access_token) as JwtPayload : null;
  const username = userData?.username || 'Usuario Desconocido';

  const WEBSOCKET_URL = `wss://r2ac4l8vld.execute-api.us-east-2.amazonaws.com/dev/?username=${username}`;

  const signOutRedirect = () => {
    const clientId = "1757s9m6km1pm08409p2k2i3ta";
    const logoutUri = "<logout uri>";
    const cognitoDomain = "https://us-east-2jghvbf7k2.auth.us-east-2.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

const pingSentRef = useRef(false);

useEffect(() => {
  if (!auth.isAuthenticated || !username) return;

  const ws = new WebSocket(WEBSOCKET_URL);
  let pingInterval: ReturnType<typeof setInterval>;

  ws.onopen = () => {
    console.log('Conectado a WebSocket');

    // Establecer el ping cada 2 minutos
    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'ping' }));
        pingSentRef.current = true;
        console.log('Ping enviado');
      }
    }, 2 * 60 * 1000);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (pingSentRef.current) {
        // Ignoramos el siguiente mensaje como respuesta a ping
        pingSentRef.current = false;
        return;
      }

      if (data.message) {
        setMessages(prev => [...prev, { text: data.message, from: 'server' }]);
      }
    } catch (err) {
      console.error('Error parsing mensaje:', err);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket desconectado');
    clearInterval(pingInterval); // Limpiar ping si se cierra
  };

  setSocket(ws);

  return () => {
    ws.close();
    clearInterval(pingInterval); // Limpiar también al desmontar
  };
}, [auth.isAuthenticated, WEBSOCKET_URL, username]);


  const sendMessage = () => {
  if (!input.trim() || !socket || socket.readyState !== WebSocket.OPEN || !selectedUser) return;

  const payload = {
  action: 'sendMessage',
  message: input,
  toUsername: selectedUser.username,
  fromUsername: username,
};


  socket.send(JSON.stringify(payload));
  setMessages(prev => [...prev, { text: input, from: 'user' }]);
  setInput('');
};


  useEffect(() => {
    // Scroll automático al último mensaje
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const styles = {
    container: {
      maxWidth: 600,
      margin: '40px auto',
      padding: 20,
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column' as React.CSSProperties['flexDirection'],
      height: '80vh',
      border: '1px solid #ccc',
      borderRadius: 8,
    } as React.CSSProperties,
    chatBox: {
      flex: 1,
      border: '1px solid #ddd',
      padding: 10,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column' as React.CSSProperties['flexDirection'],
      gap: 10,
      marginBottom: 10,
      backgroundColor: '#fafafa',
    } as React.CSSProperties,
    message: {
      maxWidth: '70%',
      padding: '10px 15px',
      borderRadius: 20,
      fontSize: 16,
      wordWrap: 'break-word',
    } as React.CSSProperties,
    inputContainer: {
      display: 'flex',
    } as React.CSSProperties,
    input: {
      flex: 1,
      padding: 10,
      fontSize: 16,
      borderRadius: 20,
      border: '1px solid #ccc',
      outline: 'none',
    } as React.CSSProperties,
    button: {
      marginLeft: 10,
      padding: '10px 20px',
      fontSize: 16,
      borderRadius: 20,
      border: 'none',
      backgroundColor: '#2196F3',
      color: 'white',
      cursor: 'pointer',
    } as React.CSSProperties,
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  return (
    
  <div>
    {!auth.isAuthenticated ? (
      <div>
        <button onClick={() => auth.signinRedirect()}>Sign in</button>
        <button onClick={() => signOutRedirect()}>Sign out</button>
      </div>
    ) : (
      <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
        {/* Panel izquierdo: lista de usuarios */}
        <div style={{ width: '25%', borderRight: '1px solid #ccc', padding: '1rem' }}>
          <h3>Usuarios conectados</h3>
          <UserListWithChat
            currentUserId={userData?.sub || ''}
            onUserSelect={(user) => {
              setSelectedUser(user);
              console.log('Iniciando chat con', user.name);
            }}
          />
          <div style={{ marginTop: '2rem' }}>
            <pre> Hello: {userData?.username} </pre>
            <button
              onClick={() => {
                if (socket && socket.readyState === WebSocket.OPEN) {
                  socket.close();
                }
                auth.removeUser();
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Panel derecho: chat */}
        <div style={styles.container}>
          <h2>
            Chat con: {selectedUser ? selectedUser.name : 'Selecciona un usuario'}
          </h2>
          <div style={styles.chatBox}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.message,
                  alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.from === 'user' ? '#DCF8C6' : '#EEE',
                }}
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={styles.inputContainer}>
            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe un mensaje..."
            />
            <button style={styles.button} onClick={sendMessage}>Enviar</button>
          </div>
        </div>
      </div>
    )}
  </div>
);

}

export default App;
