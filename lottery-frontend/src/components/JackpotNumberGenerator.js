// RandomNumberGenerator.js
import React from 'react';

const JackpotNumberGenerator = ({ winnerNumber }) => {
  return (
    <div className="random-number-generator">
      <h3>Winner Number: {winnerNumber}</h3>
      {/* Add logic to generate and display random number */}
    </div>
  );
};

export default JackpotNumberGenerator;
