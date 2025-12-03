import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AgentsPage from './pages/AgentsPage';
import StoryWorkshopPage from './pages/StoryWorkshopPage';

function App() {
  return (
    <Router>
      <div className="app">
        {/* 全局导航链接 */}
        <div className="global-nav">
          <Link to="/" className="global-nav-link">Home</Link>
          <Link to="/agents" className="global-nav-link">AI Agents</Link>
          <Link to="/story-workshop" className="global-nav-link">Story Workshop</Link>
        </div>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/story-workshop" element={<StoryWorkshopPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
