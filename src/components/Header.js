import React from 'react';

function Header({ user, input, setInput, onSearch, onUserClick }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="date">
          <span>📅</span>
          <span>{getDate()}</span>
        </div>
        <div className="header-icons">
          <button className="icon-btn" onClick={onUserClick}>
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
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
        <button className="mic-btn" onClick={onSearch}>🎤</button>
      </div>
    </header>
  );
}

export default Header;
