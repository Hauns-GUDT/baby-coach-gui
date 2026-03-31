import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ChatBot from './pages/ChatBot';
import Dashboard from './pages/Dashboard';
import Tracking from './pages/Tracking';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chatbot" element={<ChatBot/>} />
          <Route path="/tracking" element={<Tracking />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
