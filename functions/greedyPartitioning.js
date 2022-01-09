const greedyPartitioning = (array, numberOfTeams) => {
  const sorted = array.sort((a, b) => b.mmr - a.mmr);

  const out = [...Array(numberOfTeams)].map(() => {
    return {
      sum: 0,
      elements: [],
    };
  });

  for (const elem of sorted) {
    const chosenTeam = out.sort((a, b) => a.sum - b.sum)[0];
    chosenTeam.elements.push(elem);
    chosenTeam.sum += elem.mmr;
  }

  return out.map(team => team.elements);
};

module.exports = greedyPartitioning;