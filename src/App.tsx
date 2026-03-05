import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GameDetailPage from './pages/GameDetailPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: '#05160E' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:id" element={<GameDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
