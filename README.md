# Mock Interview - DSA

A mock interview platform for Data Structures & Algorithms. Two users can share a room with real-time video/audio (WebRTC), synchronized code editor (Socket.io), and LeetCode-style questions.

## Features

- **Create or Join Room** – Create a room and share the ID, or join with an existing ID
- **WebRTC** – Face-to-face video and audio between interviewer and interviewee
- **Real-time Code Editor** – Monaco editor with Socket.io sync (both users see the same code)
- **10 Easy DSA Questions** – Random question when both users join
- **JavaScript Only** – Solutions must be written in JavaScript
- **Test Cases** – 2–3 visible test cases, 10 total (hidden ones show X/10 passed)
- **1-Hour Room Expiry** – Rooms expire after 60 minutes

## Tech Stack

- **Frontend:** React, Vite, Monaco Editor, Socket.io-client
- **Backend:** Node.js, Express, Socket.io
- **Storage:** `database.js` (in-memory, no DB)

## Setup

```bash
# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

## Run

```bash
# Terminal 1 – start server (port 3001)
cd server && npm run dev

# Terminal 2 – start client (port 5173)
cd client && npm run dev
```

Open http://localhost:5173

### Access from another machine (e.g. for testing)

1. Find your machine's local IP: `ip addr` (Linux) or `ipconfig` (Windows).
2. On the other machine, open `https://YOUR_IP:5173` (e.g. `https://192.168.1.5:5173`).
3. **HTTPS is required** – Cameras only work in secure contexts. Accept the self-signed cert warning.
4. The Vite proxy forwards API/Socket.io to the server automatically.

## Flow

1. **Landing** – Enter email, create room or join with room ID
2. **Create Room** → Waiting room (share room ID, wait for peer)
3. **Join Room** → Direct to interview room
4. **Interview Room** – Video, question, code editor. Run code to test against 10 test cases.

## Auth Note

Auth (email/password) is handled externally. This app expects the user to be logged in before reaching the landing page. Email is passed via URL param `?email=...` or stored in `localStorage` after first use.
