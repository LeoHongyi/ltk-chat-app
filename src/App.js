import { useState, useEffect } from 'react';
import ChatModal from './components/ChatModal';
import UserModal from './components/UserModal';

function App() {
  // 用户状态
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [userName, setUserName] = useState('');

  // 聊天状态
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // 当前卡片索引
  const [currentCard, setCurrentCard] = useState(0);

  // 保存用户信息
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  // 创建用户
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!userName.trim()) return;

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName.trim() }),
      });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setShowUserModal(false);
        setUserName('');
      }
    } catch (err) {
      // 如果 API 失败，本地创建
      setUser({ id: Date.now(), name: userName.trim() });
      setShowUserModal(false);
      setUserName('');
    }
  };

  // 发送消息
  const sendMessage = async (text) => {
    const message = text || input.trim();
    if (!message || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query Chat($prompt: String!) { chat(prompt: $prompt) { reply } }`,
          variables: { prompt: message },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.data.chat.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  // 退出登录
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setShowUserModal(false);
  };

  // 卡片数据
  const cards = [
    { logo: 'LTK', title: ['Designer Soul.', 'Developer Brain.'], status: 'available for work' },
    { logo: 'LTK', title: ['Creative', 'Solutions.'], status: 'building the future' },
    { logo: 'LTK', title: ['Clean Code.', 'Bold Ideas.'], status: 'always learning' },
  ];

  // 项目数据
  const projects = [
    { icon: '🎨', tag: 'Design', title: 'Brand Identity', desc: 'Complete visual identity systems for modern brands.' },
    { icon: '💻', tag: 'Development', title: 'Web Applications', desc: 'Full-stack web apps with React and Node.js.' },
    { icon: '📱', tag: 'Mobile', title: 'App Design', desc: 'Native and cross-platform mobile experiences.' },
    { icon: '🤖', tag: 'AI', title: 'AI Integration', desc: 'Smart solutions powered by machine learning.' },
  ];

  // 切换卡片
  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  // 重新排序卡片以实现堆叠效果
  const getOrderedCards = () => {
    const ordered = [];
    for (let i = 0; i < cards.length; i++) {
      ordered.push(cards[(currentCard + i) % cards.length]);
    }
    return ordered;
  };

  return (
    <div className="app">
      {/* 顶部导航 */}
      <nav className="nav">
        <div className="nav-left">
          <div className="nav-circle" onClick={prevCard}>←</div>
          <span className="nav-page">{String(currentCard + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}</span>
        </div>
        <div className="nav-right">
          <div className="nav-circle" onClick={() => setShowUserModal(true)}>
            {user ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
        </div>
      </nav>

      {/* 卡片堆叠 */}
      <div className="cards-container">
        <div className="card-stack" onClick={nextCard}>
          {getOrderedCards().map((card, index) => (
            <div key={index} className="card" style={{ zIndex: cards.length - index }}>
              <div className="card-logo">{card.logo}</div>
              <h1 className="card-title">
                {card.title.map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </h1>
              <div className="card-status">
                {card.status}<span className="cursor-blink">_</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 项目网格 */}
      <div className="projects-grid">
        {projects.map((project, index) => (
          <div key={index} className="project-card">
            <div className="project-header">
              <div className="project-icon">{project.icon}</div>
              <span className="project-tag">{project.tag}</span>
            </div>
            <h3 className="project-title">{project.title}</h3>
            <p className="project-desc">{project.desc}</p>
          </div>
        ))}
      </div>

      {/* 关于我 */}
      <div className="about-section">
        <div className="about-card">
          <h4 className="about-title">About</h4>
          <p className="about-content">
            A passionate designer and developer creating digital experiences that matter.
            I blend creativity with technical expertise to build products that users love.
          </p>
        </div>
        <div className="about-card">
          <h4 className="about-title">Skills</h4>
          <div className="skills-list">
            <span className="skill-tag">React</span>
            <span className="skill-tag">TypeScript</span>
            <span className="skill-tag">Node.js</span>
            <span className="skill-tag">Figma</span>
            <span className="skill-tag">UI/UX</span>
            <span className="skill-tag">AI/ML</span>
          </div>
        </div>
        <div className="about-card full">
          <h4 className="about-title">Contact</h4>
          <p className="about-content">
            Let's create something amazing together. Reach out for collaborations or just to say hello.
          </p>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="footer">
        <p>Built with passion. Powered by AI.</p>
      </footer>

      {/* 聊天按钮 */}
      <button className="chat-fab" onClick={() => setShowChat(true)}>💬</button>

      {/* 聊天模态框 */}
      <ChatModal
        show={showChat}
        onClose={() => setShowChat(false)}
        user={user}
        messages={messages}
        input={input}
        setInput={setInput}
        onSend={sendMessage}
        loading={loading}
      />

      {/* 用户设置模态框 */}
      <UserModal
        show={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={user}
        userName={userName}
        setUserName={setUserName}
        onSubmit={handleCreateUser}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
