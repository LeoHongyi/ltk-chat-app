import React from 'react';

function AppointmentCard() {
  return (
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
  );
}

export default AppointmentCard;
