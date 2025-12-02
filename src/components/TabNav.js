import React from 'react';

const TABS = ['All', 'Insights', 'Meds', 'Todo list', 'Appointment'];

function TabNav({ activeTab, setActiveTab }) {
  return (
    <div className="tabs">
      {TABS.map(tab => (
        <button
          key={tab}
          className={`tab ${activeTab === tab ? 'active' : ''}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default TabNav;
