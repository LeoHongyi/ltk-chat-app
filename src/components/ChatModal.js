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
          <button className="chat-close" onClick={onClose}>✕</button>
          <div className="chat-avatar">🤖</div>
          <div className="chat-greeting">
            Hey, {user?.name || 'there'}!<br />
            How can I <span className="highlight">help you</span>?
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="chat-suggestions">
            <div className="chat-suggestions-title">Things you can do!</div>
            <div className="suggestion-item" onClick={() => onSend('Book an appointment')}>
              <div className="suggestion-icon blue">📅</div>
              <div className="suggestion-text">
                <h4>Appointment book</h4>
                <p>Book an appointment with ease & stay organized</p>
              </div>
            </div>
            <div className="suggestion-item" onClick={() => onSend('Set a medication reminder')}>
              <div className="suggestion-icon red">💊</div>
              <div className="suggestion-text">
                <h4>Meds reminder</h4>
                <p>Set timely reminders to take your medication</p>
              </div>
            </div>
            <div className="suggestion-item" onClick={() => onSend('Add task to my todo list')}>
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
              onKeyDown={(e) => e.key === 'Enter' && onSend()}
            />
            <button className="mic-btn" onClick={() => onSend()}>🎤</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatModal;
