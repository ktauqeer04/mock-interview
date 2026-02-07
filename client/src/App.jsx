import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import WaitingRoom from './pages/WaitingRoom';
import InterviewRoom from './pages/InterviewRoom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/waiting/:roomId" element={<WaitingRoom />} />
      <Route path="/room/:roomId" element={<InterviewRoom />} />
    </Routes>
  );
}

export default App;
