import React, { useRef, useEffect } from 'react';

function ChatModal({ show, onClose, user, messages, input, setInput, onSend, loading }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!show) return null;

  return (
    <div className="chat-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="chat-panel">
        <div className="chat-header">
          <h2 className="chat-title">Chat with AI</h2>
          <button className="chat-close" onClick={onClose}>×</button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <p>Hey{user ? `, ${user.name}` : ''}! Ask me anything.</p>
              <p>I'm here to help.</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-bubble">{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div className="message assistant loading">
                  <div className="message-bubble">Thinking...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="chat-input-area">
          <div className="chat-input-box">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
            />
            <button
              className="chat-send-btn"
              onClick={() => onSend()}
              disabled={loading || !input.trim()}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatModal;
