import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import styles from './InterviewRoom.module.css';

const API_BASE = '/api';
const SOCKET_URL = window.location.origin;

function runCode(code, funcName, inputs) {
  try {
    const fn = new Function(`${code}; return typeof ${funcName} === 'function' ? ${funcName} : null`)();
    if (!fn) return { error: `Expected function ${funcName}` };
    const result = fn(...inputs);
    return { result };
  } catch (err) {
    return { error: err.message };
  }
}

function formatInput(question, inputs) {
  const names = question.paramNames || [];
  if (names.length === 0) return JSON.stringify(inputs);
  return inputs.map((v, i) => `${names[i] || 'arg' + i} = ${JSON.stringify(v)}`).join(', ');
}

function formatDescription(desc) {
  const idx = desc.indexOf('Example:');
  if (idx >= 0) return desc.substring(0, idx).trim();
  return desc;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => keysB.includes(k) && deepEqual(a[k], b[k]));
  }
  return false;
}

export default function InterviewRoom() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || localStorage.getItem('mockInterviewEmail') || '';
  const [room, setRoom] = useState(null);
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [selectedCase, setSelectedCase] = useState(0);
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const isCreatorRef = useRef(false);
  const lastOfferTimestamp = useRef(0);
  const lastAnswerTimestamp = useRef(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [roomRes, questionRes] = await Promise.all([
          fetch(`${API_BASE}/rooms/${roomId}`),
          fetch(`${API_BASE}/rooms/${roomId}/question`),
        ]);
        const roomData = await roomRes.json();
        const questionData = await questionRes.json();
        if (!roomRes.ok) throw new Error(roomData.error || 'Room not found');
        if (!questionRes.ok) throw new Error(questionData.error || 'Question not found');
        setRoom(roomData);
        setQuestion(questionData);
        setCode(questionData.template || '');
        const remaining = Math.max(0, Math.floor((roomData.expiresAt - Date.now()) / 1000));
        setTimeLeft(remaining);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [roomId]);

  useEffect(() => {
    if (!room || !question) return;
    const socket = io(SOCKET_URL, { path: '/socket.io' });
    socketRef.current = socket;
    isCreatorRef.current = room.creatorEmail === email;

    socket.emit('join-room', { roomId, email });
    socket.on('code-update', ({ code: newCode }) => setCode(newCode));

    return () => socket.disconnect();
  }, [roomId, email, room, question]);

  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const handleCodeChange = useCallback((value) => {
    setCode(value || '');
    socketRef.current?.emit('code-update', { roomId, code: value || '' });
  }, [roomId]);

  const handleRun = async () => {
    if (!question) return;
    setRunning(true);
    setResults(null);
    setError('');
    const visible = question.testCases.filter((t) => t.visible);
    const hidden = question.testCases.filter((t) => !t.visible);
    const runResults = [];
    let passedCount = 0;

    for (const tc of question.testCases) {
      const { result, error: runErr } = runCode(code, question.funcName, tc.inputs);
      const passed = !runErr && deepEqual(result, tc.expected);
      if (passed) passedCount++;
      runResults.push({ ...tc, result, error: runErr, passed });
    }

    setResults(runResults);
    setRunning(false);

    const allPassed = passedCount === question.testCases.length;
    if (allPassed) {
      try {
        await fetch(`${API_BASE}/rooms/${roomId}/result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, questionId: question.id, solved: true }),
        });
      } catch (_) {}
    }
  };

  useEffect(() => {
    if (!room || !localVideoRef.current || !remoteVideoRef.current) return;

    const iceCandidateQueue = [];
    let hasRemoteDescription = false;
    let isNegotiating = false;
    let makingOffer = false;

    const drainIceCandidates = async () => {
      while (iceCandidateQueue.length > 0) {
        const candidate = iceCandidateQueue.shift();
        try {
          await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('ICE candidate error:', err);
        }
      }
    };

    const initWebRTC = async () => {
      let stream;
      try {
        console.log('Requesting media devices...');
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log('Got local stream');
      } catch (err) {
        console.error('Camera/mic error:', err);
        setError('Camera/microphone access required. Use HTTPS and allow permissions.');
        return;
      }

      localStreamRef.current = stream;
      localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject',
          },
          {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject',
          },
        ]
      });
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (e) => {
        console.log('Remote track received:', e.track.kind);
        if (remoteVideoRef.current && e.streams[0]) {
          remoteVideoRef.current.srcObject = e.streams[0];
          remoteVideoRef.current.play().catch(() => {});
          setHasRemoteStream(true);
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          const candidateData = e.candidate.toJSON ? e.candidate.toJSON() : e.candidate;
          socketRef.current?.emit('webrtc-ice-candidate', { roomId, candidate: candidateData });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
      };

      const handleOffer = async ({ offer }) => {
        const now = Date.now();
        if (now - lastOfferTimestamp.current < 2000) {
          console.log('Ignoring duplicate offer (too soon)');
          return;
        }
        lastOfferTimestamp.current = now;

        if (isNegotiating) {
          console.log('Already negotiating, ignoring offer');
          return;
        }

        // Handle offer collision
        if (pc.signalingState === 'have-local-offer') {
          const polite = !isCreatorRef.current;
          if (polite) {
            console.log('Offer collision: We are polite, rolling back');
            try {
              await pc.setLocalDescription({ type: 'rollback' });
              makingOffer = false;
            } catch (err) {
              console.error('Rollback error:', err);
              return;
            }
          } else {
            console.log('Offer collision: We are impolite, ignoring incoming offer');
            return;
          }
        }

        if (pc.signalingState !== 'stable') {
          console.warn('Cannot handle offer in state:', pc.signalingState);
          return;
        }

        try {
          isNegotiating = true;
          console.log('Handling offer, current state:', pc.signalingState);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          hasRemoteDescription = true;
          await drainIceCandidates();
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current?.emit('webrtc-answer', { roomId, answer });
          console.log('Answer sent');
        } catch (err) {
          console.error('WebRTC offer error:', err);
        } finally {
          isNegotiating = false;
        }
      };

      const handleAnswer = async ({ answer }) => {
        const now = Date.now();
        if (now - lastAnswerTimestamp.current < 2000) {
          console.log('Ignoring duplicate answer (too soon)');
          return;
        }
        lastAnswerTimestamp.current = now;

        if (pc.signalingState !== 'have-local-offer') {
          console.warn('Cannot handle answer in state:', pc.signalingState);
          return;
        }

        try {
          console.log('Handling answer, current state:', pc.signalingState);
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          hasRemoteDescription = true;
          await drainIceCandidates();
          console.log('Answer processed');
        } catch (err) {
          console.error('WebRTC answer error:', err);
        }
      };

      const handleIce = async ({ candidate }) => {
        if (!candidate) return;
        if (hasRemoteDescription && pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            if (!err.message.includes('Unknown ufrag')) {
              console.error('ICE candidate error:', err);
            }
          }
        } else {
          iceCandidateQueue.push(candidate);
        }
      };

      const sendOffer = async () => {
        if (makingOffer || isNegotiating || pc.signalingState !== 'stable') {
          console.log('Cannot send offer, state:', pc.signalingState);
          return;
        }

        try {
          makingOffer = true;
          isNegotiating = true;
          console.log('Creating offer, current state:', pc.signalingState);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current?.emit('webrtc-offer', { roomId, offer });
          console.log('Offer sent');
        } catch (err) {
          console.error('WebRTC create offer error:', err);
        } finally {
          makingOffer = false;
          isNegotiating = false;
        }
      };

      socketRef.current?.on('webrtc-offer', handleOffer);
      socketRef.current?.on('webrtc-answer', handleAnswer);
      socketRef.current?.on('webrtc-ice-candidate', handleIce);
      socketRef.current?.on('request-offer', sendOffer);

      if (isCreatorRef.current) {
        setTimeout(sendOffer, 1000);
      } else {
        setTimeout(() => {
          socketRef.current?.emit('request-offer', { roomId });
        }, 500);
      }
    };

    initWebRTC();

    return () => {
      setHasRemoteStream(false);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerConnectionRef.current?.close();
      socketRef.current?.off('webrtc-offer');
      socketRef.current?.off('webrtc-answer');
      socketRef.current?.off('webrtc-ice-candidate');
      socketRef.current?.off('request-offer');
    };
  }, [room, roomId]);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <p>{error}</p>
          <a href="/">Back to Home</a>
        </div>
      </div>
    );
  }

  if (!room || !question) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  const visibleCases = question.testCases.filter((t) => t.visible);
  const visibleResults = results ? results.filter((r) => r.visible) : [];
  const hiddenCount = results ? results.filter((r) => !r.visible).length : 0;
  const hiddenPassed = results ? results.filter((r) => !r.visible && r.passed).length : 0;
  const selectedResult = visibleResults[selectedCase];
  const selectedTestCase = visibleCases[selectedCase];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>{question.id}. {question.title}</h1>
        <span className={styles.timer}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
      </header>

      <div className={styles.main}>
        <div className={styles.videos}>
          <div className={styles.videoBox}>
            <span>You</span>
            <video ref={localVideoRef} autoPlay muted playsInline />
          </div>
          <div className={styles.videoBox}>
            <span>Peer</span>
            <video ref={remoteVideoRef} autoPlay playsInline className={!hasRemoteStream ? styles.videoHidden : ''} />
            {!hasRemoteStream && (
              <div className={styles.videoPlaceholder}>Waiting for peer...</div>
            )}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.problemPanel}>
            <h2 className={styles.problemTitle}>{question.id}. {question.title}</h2>
            <div className={styles.problemMeta}>
              <span className={styles.difficulty}>{question.difficulty}</span>
              <div className={styles.interactionMeta}>
                <span>👍 0</span>
                <span>👎 0</span>
                <span>⭐</span>
              </div>
            </div>
            <div className={styles.problemDescription}>
              {formatDescription(question.description).split('\n').map((p, i) => (
                <p key={i} style={{ marginBottom: '0.75rem' }}>{p}</p>
              ))}
            </div>
            <div className={styles.examplesSection}>
              {visibleCases.map((tc, i) => (
                <div key={i} className={styles.exampleBlock}>
                  <div className={styles.exampleLabel}>Input:</div>
                  <div className={styles.exampleValue}>{formatInput(question, tc.inputs)}</div>
                  <div className={styles.exampleLabel} style={{ marginTop: '0.5rem' }}>Output:</div>
                  <div className={styles.exampleValue}>{JSON.stringify(tc.expected)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.editorPanel}>
            <div className={styles.editorWrapper}>
              <div className={styles.editor}>
                <Editor
                  height="100%"
                  language="javascript"
                  value={code}
                  onChange={handleCodeChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>

            <div className={styles.testcasesSection}>
              <div className={styles.testcasesTitle}>Testcases</div>
              <div className={styles.caseTabs}>
                {visibleCases.map((_, i) => (
                  <button
                    key={i}
                    className={i === selectedCase ? styles.caseTabActive : styles.caseTab}
                    onClick={() => setSelectedCase(i)}
                  >
                    Case {i + 1}
                  </button>
                ))}
              </div>
              <div className={styles.inputOutputBox}>
                <div className={styles.inputOutputLabel}>Input:</div>
                <div className={styles.inputOutputValue}>
                  {selectedTestCase ? formatInput(question, selectedTestCase.inputs) : ''}
                </div>
              </div>
              <div className={styles.inputOutputBox}>
                <div className={styles.inputOutputLabel}>Output:</div>
                <div className={`${styles.inputOutputValue} ${!selectedResult ? styles.outputEmpty : ''}`}>
                  {selectedResult
                    ? selectedResult.error
                      ? <span className={styles.resultFail}>{selectedResult.error}</span>
                      : <span className={selectedResult.passed ? styles.resultPass : styles.resultFail}>
                          {JSON.stringify(selectedResult.result)}
                          {selectedResult.passed ? ' ✓' : ' ✗'}
                        </span>
                    : 'Run to see output'}
                </div>
              </div>
              {hiddenCount > 0 && results && (
                <p className={styles.hiddenSummary}>
                  Hidden tests: {hiddenPassed}/{hiddenCount} passed
                </p>
              )}
              <div className={styles.actionRow}>
                <button onClick={handleRun} disabled={running} className={styles.runBtn}>
                  {running ? 'Running...' : 'Run'}
                </button>
                <button onClick={handleRun} disabled={running} className={styles.submitBtn}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}