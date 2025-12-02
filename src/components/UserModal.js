import React from 'react';

function UserModal({ show, onClose, user, userName, setUserName, onSubmit, onLogout }) {
  if (!show) return null;

  return (
    <div className="settings-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="settings-panel">
        <h2 className="settings-title">{user ? 'Account' : 'Create Account'}</h2>

        {user ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--text-primary)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: '600',
                margin: '0 auto 16px'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <p style={{ fontSize: '18px', fontWeight: '600' }}>{user.name}</p>
            </div>
            <button className="settings-btn secondary" onClick={onLogout}>
              Sign Out
            </button>
            <button className="settings-btn secondary" onClick={onClose}>
              Close
            </button>
          </>
        ) : (
          <form className="settings-form" onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoFocus
            />
            <button type="submit" className="settings-btn">
              Continue
            </button>
            <button type="button" className="settings-btn secondary" onClick={onClose}>
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default UserModal;
