// Shuffles the order of a team to make sure that the first player in the team is not always the same based on their rating

const shuffleTeamOrder = (team) => {
  for (let currentIndex = team.length - 1; currentIndex > 0; currentIndex--) {
    // Generate a random index from the remaining unshuffled elements
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1));

    // Swap the current element with the randomly selected one
    const currentElement = team[currentIndex];
    const randomElement = team[randomIndex];
    team[currentIndex] = randomElement;
    team[randomIndex] = currentElement;
  }

  return team;
};

export default shuffleTeamOrder;