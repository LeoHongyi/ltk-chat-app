import React from 'react';

function MoodCard() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon mood">😊</div>
        <div>
          <div className="card-title">Your mood</div>
          <div className="card-subtitle">How are you feeling now? Grateful</div>
        </div>
      </div>
    </div>
  );
}

export default MoodCard;
