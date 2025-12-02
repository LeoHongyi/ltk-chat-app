import React from 'react';

function UserModal({ show, onClose, user, userName, setUserName, onSubmit, onLogout }) {
  if (!show) return null;

  return (
    <div className="user-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="user-panel">
        <h2>{user ? '编辑用户' : '创建用户'}</h2>
        <form className="user-form" onSubmit={onSubmit}>
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
              onClick={onLogout}
            >
              退出登录
            </button>
          )}
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
          >
            取消
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserModal;
