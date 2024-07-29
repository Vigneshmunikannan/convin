function calculateEqualSplit(amount, participants) {
    const splitAmount = amount / participants.length;
    return participants.map(participant => ({ user: participant, amountOwed: splitAmount }));
  }
  
  function calculateExactSplit(amount, exactAmounts) {
    return exactAmounts.map(participant => ({ user: participant.user, amountOwed: participant.amountOwed }));
  }
  
  function calculatePercentageSplit(amount, percentages) {
    return percentages.map(participant => ({ user: participant.user, amountOwed: (amount * participant.percentage) / 100 }));
  }
  
  module.exports = {
    calculateEqualSplit,
    calculateExactSplit,
    calculatePercentageSplit
  };
  