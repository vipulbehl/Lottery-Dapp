// App.js
import React, { useState } from 'react';
import ConnectWalletButton from './components/ConnectWalletButton';
import JackpotAmount from './components/JackpotAmount';
import RandomNumberGenerator from './components/JackpotNumberGenerator';
import ActionButtons from './components/ActionButtons';
import './styles.css';

const App = () => {
  const [jackpotAmount, setJackpotAmount] = useState(1000000);
  const [winnerNumber, setWinnerNumber] = useState(null);

  const handlePlay = () => {
    // Add logic to handle the Play button click
    // This can include updating jackpot amount, generating a winner number, etc.
  };

  const handleBuyTicket = () => {
    // Add logic to handle the Buy Ticket button click
  };

  return (
    <div>
      <ConnectWalletButton />
      <JackpotAmount amount={jackpotAmount} />
      <RandomNumberGenerator winnerNumber={winnerNumber} />
      <ActionButtons onPlay={handlePlay} onBuyTicket={handleBuyTicket} />
    </div>
  );
};

export default App;
