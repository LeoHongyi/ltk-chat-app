import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Mastra Worker API endpoint
// Development: http://localhost:8787/api
// Production: Set REACT_APP_MASTRA_API_URL environment variable or use same-origin /api
const MASTRA_API_URL = process.env.REACT_APP_MASTRA_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8787/api');

function AgentsPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('assistant');
  const [toolCalls, setToolCalls] = useState([]);
  const messagesEndRef = useRef(null);

  // Mastra AI Agents - powered by @mastra/core
  const agents = [
    {
      id: 'assistant',
      name: 'Assistant',
      description: 'General AI assistant with weather, calculator, and text analysis tools',
      icon: '🤖',
      color: '#6366f1',
      tools: ['weather', 'calculator', 'text-analyzer']
    },
    {
      id: 'coder',
      name: 'Coder',
      description: 'Expert in programming with code analysis tools',
      icon: '💻',
      color: '#10b981',
      tools: ['code-analyzer', 'calculator']
    },
    {
      id: 'writer',
      name: 'Writer',
      description: 'Creative writing specialist with text analysis',
      icon: '✍️',
      color: '#f59e0b',
      tools: ['text-analyzer']
    },
    {
      id: 'analyst',
      name: 'Analyst',
      description: 'Data analysis expert with calculator and weather tools',
      icon: '📊',
      color: '#ec4899',
      tools: ['calculator', 'weather', 'text-analyzer']
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${MASTRA_API_URL}/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          agentId: selectedAgent,
          history: messages.slice(-10) // Send last 10 messages as context
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Track tool calls if any were made by the Mastra agent
      if (data.toolCalls && data.toolCalls.length > 0) {
        setToolCalls(prev => [...prev, ...data.toolCalls]);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        agent: selectedAgent,
        toolCalls: data.toolCalls || []
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
        agent: selectedAgent
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const currentAgent = agents.find(a => a.id === selectedAgent);

  return (
    <div className="agents-page">
      {/* 顶部导航 */}
      <nav className="nav">
        <div className="nav-left">
          <Link to="/" className="nav-circle">←</Link>
          <span className="nav-page">AI Agents</span>
        </div>
        <div className="nav-right">
          <button className="nav-circle" onClick={clearChat} title="Clear chat">
            🗑️
          </button>
        </div>
      </nav>

      <div className="agents-container">
        {/* Agent 选择侧边栏 */}
        <aside className="agents-sidebar">
          <h3 className="sidebar-title">Select Agent</h3>
          <div className="agents-list">
            {agents.map(agent => (
              <div
                key={agent.id}
                className={`agent-item ${selectedAgent === agent.id ? 'active' : ''}`}
                onClick={() => setSelectedAgent(agent.id)}
                style={{ '--agent-color': agent.color }}
              >
                <span className="agent-icon">{agent.icon}</span>
                <div className="agent-info">
                  <span className="agent-name">{agent.name}</span>
                  <span className="agent-desc">{agent.description}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* 聊天区域 */}
        <main className="chat-main">
          <div className="chat-header">
            <span className="current-agent-icon" style={{ background: currentAgent?.color }}>
              {currentAgent?.icon}
            </span>
            <div className="current-agent-info">
              <h2>{currentAgent?.name}</h2>
              <p>{currentAgent?.description}</p>
              {currentAgent?.tools && (
                <div className="agent-tools">
                  {currentAgent.tools.map(tool => (
                    <span key={tool} className="tool-badge">{tool}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">{currentAgent?.icon}</div>
                <h3>Start a conversation</h3>
                <p>Send a message to {currentAgent?.name} to get started.</p>
                <div className="mastra-badge">
                  Powered by <strong>Mastra</strong>
                </div>
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <span className="message-agent-icon">
                    {agents.find(a => a.id === msg.agent)?.icon || '🤖'}
                  </span>
                )}
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <span className="message-agent-icon">{currentAgent?.icon}</span>
                <div className="message-content typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${currentAgent?.name}...`}
              rows={1}
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AgentsPage;
