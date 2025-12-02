import React, { useState, useRef, useEffect } from 'react';

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

  // 待办事项
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Schedule blood work', completed: true },
      { id: 2, text: 'Pick up medication', completed: false },
    ];
  });

  // 当前标签
  const [activeTab, setActiveTab] = useState('All');

  const messagesEndRef = useRef(null);

  // 保存用户信息
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  // 保存待办事项
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // 自动滚动消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 获取问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // 获取日期
  const getDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
      setMessages(prev => [...prev, { role: 'assistant', content: `错误: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  // 切换待办完成状态
  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // 添加待办
  const addTodo = (text) => {
    setTodos(prev => [...prev, { id: Date.now(), text, completed: false }]);
  };

  const tabs = ['All', 'Insights', 'Meds', 'Todo list', 'Appointment'];

  return (
    <div className="app">
      {/* 头部 */}
      <header className="header">
        <div className="header-top">
          <div className="date">
            <span>📅</span>
            <span>{getDate()}</span>
          </div>
          <div className="header-icons">
            <button className="icon-btn" onClick={() => setShowUserModal(true)}>
              👤
            </button>
            <button className="icon-btn">⊞</button>
          </div>
        </div>

        <div className="greeting">
          <h1>
            {getGreeting()},<br />
            {user ? user.name : 'Guest'}!
          </h1>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Ask anything about your health?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className="mic-btn" onClick={() => setShowChat(true)}>🎤</button>
        </div>
      </header>

      {/* 标签导航 */}
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="content">
        {/* 心情卡片 */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon mood">😊</div>
            <div>
              <div className="card-title">Your mood</div>
              <div className="card-subtitle">How are you feeling now? Grateful</div>
            </div>
          </div>
        </div>

        {/* 双列卡片 */}
        <div className="card-grid">
          <div className="mini-card">
            <div className="mini-card-header">
              <span className="mini-card-title">Meds Reminder</span>
              <button className="card-add">+</button>
            </div>
            <div className="mini-card-content">Methimazole – 15mg</div>
            <div className="mini-card-time">08:00 PM</div>
            <div className="mini-card-actions">
              <button className="action-btn">✓ Took</button>
              <button className="action-btn">💤 Snooze</button>
            </div>
          </div>

          <div className="mini-card">
            <div className="mini-card-header">
              <span className="mini-card-title">Appointment</span>
              <button className="card-add">+</button>
            </div>
            <div className="mini-card-content">Dr. Erica - Therapy</div>
            <div className="mini-card-time">02:00 PM</div>
            <div className="mini-card-actions">
              <button className="action-btn primary">📍 Get directions</button>
            </div>
          </div>
        </div>

        {/* 待办列表 */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon todo">📋</div>
            <div>
              <div className="card-title">To-do list</div>
            </div>
            <button className="card-add" onClick={() => {
              const text = prompt('Add new task:');
              if (text) addTodo(text);
            }}>+</button>
          </div>
          {todos.map(todo => (
            <div key={todo.id} className="todo-item">
              <div
                className={`todo-checkbox ${todo.completed ? 'completed' : ''}`}
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.completed && '✓'}
              </div>
              <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                {todo.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 浮动按钮 */}
      <button className="fab" onClick={() => setShowChat(true)}>💬</button>

      {/* 聊天弹窗 */}
      {showChat && (
        <div className="chat-modal" onClick={(e) => e.target === e.currentTarget && setShowChat(false)}>
          <div className="chat-panel">
            <div className="chat-header">
              <button className="chat-close" onClick={() => setShowChat(false)}>✕</button>
              <div className="chat-avatar">🤖</div>
              <div className="chat-greeting">
                Hey, {user?.name || 'there'}!<br />
                How can I <span className="highlight">help you</span>?
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="chat-suggestions">
                <div className="chat-suggestions-title">Things you can do!</div>
                <div className="suggestion-item" onClick={() => sendMessage('Book an appointment')}>
                  <div className="suggestion-icon blue">📅</div>
                  <div className="suggestion-text">
                    <h4>Appointment book</h4>
                    <p>Book an appointment with ease & stay organized</p>
                  </div>
                </div>
                <div className="suggestion-item" onClick={() => sendMessage('Set a medication reminder')}>
                  <div className="suggestion-icon red">💊</div>
                  <div className="suggestion-text">
                    <h4>Meds reminder</h4>
                    <p>Set timely reminders to take your medication</p>
                  </div>
                </div>
                <div className="suggestion-item" onClick={() => sendMessage('Add task to my todo list')}>
                  <div className="suggestion-icon cyan">📝</div>
                  <div className="suggestion-text">
                    <h4>Add to to-do list</h4>
                    <p>Quickly add tasks to your to-do list</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.role}`}>
                    <div className="message-bubble">{msg.content}</div>
                  </div>
                ))}
                {loading && (
                  <div className="message assistant loading">
                    <div className="message-bubble">思考中...</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            <div className="chat-input-area">
              <div className="chat-input-box">
                <input
                  type="text"
                  placeholder="Ask anything about your health?"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button className="mic-btn" onClick={() => sendMessage()}>🎤</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 用户管理弹窗 */}
      {showUserModal && (
        <div className="user-modal" onClick={(e) => e.target === e.currentTarget && setShowUserModal(false)}>
          <div className="user-panel">
            <h2>{user ? '编辑用户' : '创建用户'}</h2>
            <form className="user-form" onSubmit={handleCreateUser}>
              <input
                type="text"
                placeholder="输入你的名字"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoFocus
              />
              <button type="submit">
                {user ? '更新' : '创建'}
              </button>
              {user && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setUser(null);
                    localStorage.removeItem('user');
                    setShowUserModal(false);
                  }}
                >
                  退出登录
                </button>
              )}
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowUserModal(false)}
              >
                取消
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
