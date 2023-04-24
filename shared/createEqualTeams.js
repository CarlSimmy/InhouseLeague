import shuffleTeamOrder from './shuffleTeamOrder.js';

const createEqualTeams = (playersArray) => {
  // Sort the array of ratings in descending order
  playersArray.sort((a, b) => b.rating - a.rating);

  // Initialize the current best split and its absolute difference
  let bestSplit = [];
  let bestDiff = Number.MAX_SAFE_INTEGER;
  const correctTeamLength = playersArray.length / 2;

  // Recursive function that tries all possible splits
  function trySplits(i = 0, team1 = [], team2 = []) {
    // Base case: both teams have half the elements
    if (team1.length === correctTeamLength && team2.length === correctTeamLength) {
      // Calculate the absolute difference between the sums of the two teams
      const diff = Math.abs(
        team1.reduce(
          (accumulator, currentPlayer) => accumulator + currentPlayer.rating, 0,
        ) - team2.reduce(
          (accumulator, currentPlayer) => accumulator + currentPlayer.rating, 0,
        ),
      );
      // If this split has a smaller absolute difference than the current best split, update the current best split
      if (diff < bestDiff) {
        bestSplit = [team1, team2];
        bestDiff = diff;
      }
      return;
    }

    // Recursive case: try adding the next element to either team1 or team2
    if (team1.length < correctTeamLength) {
      trySplits(i + 1, [...team1, playersArray[i]], team2);
    }
    if (team2.length < correctTeamLength) {
      trySplits(i + 1, team1, [...team2, playersArray[i]]);
    }
  }

  // Start the recursive function
  trySplits();

  // Calculate the rating sum of the two teams
  const ratingTeam1 = bestSplit[0].reduce(
    (accumulator, currentPlayer) => accumulator + currentPlayer.rating, 0,
  );
  const ratingTeam2 = bestSplit[1].reduce(
    (accumulator, currentPlayer) => accumulator + currentPlayer.rating, 0,
  );

  // Return two objects, each containing the team array and its sum
  return [
    { players: shuffleTeamOrder(bestSplit[0]), totalRating: ratingTeam1, name: 'TBD' },
    { players: shuffleTeamOrder(bestSplit[1]), totalRating: ratingTeam2, name: 'TBD' },
  ];
};

export default createEqualTeams;