import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AgentsPage from './pages/AgentsPage';

function App() {
  return (
    <Router>
      <div className="app">
        {/* 全局导航链接 */}
        <div className="global-nav">
          <Link to="/" className="global-nav-link">Home</Link>
          <Link to="/agents" className="global-nav-link">AI Agents</Link>
        </div>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/agents" element={<AgentsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
