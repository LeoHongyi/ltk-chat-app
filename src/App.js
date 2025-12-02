import { useState, useEffect } from 'react';
import Header from './components/Header';
import TabNav from './components/TabNav';
import MoodCard from './components/MoodCard';
import MedsCard from './components/MedsCard';
import AppointmentCard from './components/AppointmentCard';
import TodoList from './components/TodoList';
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

  // 退出登录
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setShowUserModal(false);
  };

  return (
    <div className="app">
      <Header
        user={user}
        input={input}
        setInput={setInput}
        onSearch={() => sendMessage()}
        onUserClick={() => setShowUserModal(true)}
      />

      <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="content">
        <MoodCard />

        <div className="card-grid">
          <MedsCard />
          <AppointmentCard />
        </div>

        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onAdd={addTodo}
        />
      </div>

      <button className="fab" onClick={() => setShowChat(true)}>💬</button>

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
