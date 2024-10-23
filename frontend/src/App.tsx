import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

function App() {
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const docId = window.location.pathname.split('/').pop();

    const newSocket = io('http://localhost:3000', {
      path: '/socket.io',
      withCredentials: true,
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('joinDocument', { docId });
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
    });

    newSocket.on('joinedDocument', (data: any) => {
      console.log('joinedDocument:', data.message);
      setContent(data.content || '');
    });

    newSocket.on('documentUpdated', (data: any) => {
      setContent(data.content);
    });

    newSocket.on('error', (error: any) => {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (socket) {
      const docId = window.location.pathname.split('/').pop();
      socket.emit('updateDocument', {
        docId,
        content: e.target.value,
      });
      console.log('Emitted updateDocument event:', {
        docId,
        content: e.target.value,
      });
    }
  };

  return (
    <div>
      <h1>Document Editor</h1>
      <textarea
        value={content}
        onChange={handleChange}
        cols={100}
        rows={30}
      ></textarea>
    </div>
  );
}

export default App;
