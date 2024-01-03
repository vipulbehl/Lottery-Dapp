// ActionButtons.js
import React from 'react';

const ActionButtons = ({ onPlay, onBuyTicket }) => {
  return (
    <div className="action-buttons">
      <button onClick={onPlay}>Play</button>
      <button onClick={onBuyTicket}>Buy Ticket</button>
    </div>
  );
};

export default ActionButtons;
