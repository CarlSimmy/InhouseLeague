/* Modded version of https://github.com/dvopalecky/greedy-number-partitioning */

const greedyPartitioning = (players, numberOfTeams) => {
  const sorted = players.sort((a, b) => b.rating - a.rating);

  const out = [...Array(numberOfTeams)].map(() => {
    return {
      sum: 0,
      elements: [],
    };
  });

  for (const elem of sorted) {
    const chosenTeam = out.sort((a, b) => a.sum - b.sum)[0];
    chosenTeam.elements.push(elem);
    chosenTeam.sum += elem.rating;
  }

  return out.map(team => team.elements);
};

module.exports = greedyPartitioning;