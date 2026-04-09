import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage'; // This should work now!

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* The :roomId is a dynamic parameter */}
          <Route path="/chat/:roomId" element={<ChatPage />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;