import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import styles from './WaitingRoom.module.css';

const API_BASE = '/api';

export default function WaitingRoom() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || localStorage.getItem('mockInterviewEmail') || '';
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    const checkRoom = async () => {
      try {
        const res = await fetch(`${API_BASE}/rooms/${roomId}`);
        const data = await res.json();
        if (res.status === 410) {
          setError('Room has expired');
          setPolling(false);
          return;
        }
        if (!res.ok) throw new Error(data.error || 'Room not found');
        setRoom(data);
        if (data.peerEmail) {
          setPolling(false);
          window.location.href = `/room/${roomId}?email=${encodeURIComponent(email)}`;
        }
      } catch (err) {
        setError(err.message);
        setPolling(false);
      }
    };

    checkRoom();
    const interval = setInterval(checkRoom, 2000);
    return () => clearInterval(interval);
  }, [roomId, email]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied!');
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.error}>{error}</p>
          <a href="/" className={styles.back}>Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Waiting for peer to join</h2>
        <p className={styles.roomId}>
          Room ID: <strong>{roomId}</strong>
        </p>
        <button onClick={copyRoomId} className={styles.copy}>
          Copy Room ID
        </button>
        <div className={styles.spinner} />
        <p className={styles.hint}>Share the Room ID with your interviewee. They can join from the home page.</p>
      </div>
    </div>
  );
}
