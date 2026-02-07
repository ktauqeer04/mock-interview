import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';

const API_BASE = '/api';

export default function Landing() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || localStorage.getItem('mockInterviewEmail') || '';
  });
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create room');
      localStorage.setItem('mockInterviewEmail', email.trim());
      navigate(`/waiting/${data.roomId}?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!roomId.trim()) {
      setError('Room ID is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rooms/${roomId.trim()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join room');
      localStorage.setItem('mockInterviewEmail', email.trim());
      navigate(`/room/${roomId.trim()}?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Mock Interview</h1>
        <p>Data Structures & Algorithms</p>
      </header>

      <div className={styles.card}>
        <div className={styles.tabs}>
          <button
            className={mode === 'create' ? styles.tabActive : styles.tab}
            onClick={() => setMode('create')}
          >
            Create Room
          </button>
          <button
            className={mode === 'join' ? styles.tabActive : styles.tab}
            onClick={() => setMode('join')}
          >
            Join Room
          </button>
        </div>

        <form onSubmit={mode === 'create' ? handleCreateRoom : handleJoinRoom} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Your Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {mode === 'join' && (
            <div className={styles.field}>
              <label htmlFor="roomId">Room ID</label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. abc123xy"
                required
              />
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} className={styles.submit}>
            {loading ? '...' : mode === 'create' ? 'Create Room' : 'Join Room'}
          </button>
        </form>
      </div>

      <p className={styles.footer}>Rooms expire after 1 hour • JavaScript only</p>
    </div>
  );
}
