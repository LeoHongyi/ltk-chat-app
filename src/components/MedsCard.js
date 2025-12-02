import React from 'react';

function MedsCard() {
  return (
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
  );
}

export default MedsCard;
