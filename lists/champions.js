const nicknameMap = {
  Heimerdinger: ['Donger', 'Heimer'],
  Gangplank: ['GP'],
  JarvanIV: ['J4'],
  Leblanc: ['LB'],
  MissFortune: ['MF'],
  MasterYi: ['Yi'],
  Blitzcrank: ['Blitz', 'Robot'],
  ChoGath: ['Cho'],
  KhaZix: ['Kha'],
  Velkoz: ['Vel'],
  TwistedFate: ['TF'],
  AurelionSol: ['ASol'],
  RekSai: ['Rek'],
  TahmKench: ['Tahm'],
};

// Get latest patch from Data Dragon.
const versions = await fetch(
  'https://ddragon.leagueoflegends.com/api/versions.json',
).then(res => res.json());

const LATEST_PATCH = versions[0];

const champRes = await fetch(
  `https://ddragon.leagueoflegends.com/cdn/${LATEST_PATCH}/data/en_US/champion.json`,
);

const champData = await champRes.json();

const champions = Object.values(champData.data).map(champ => ({
  id: champ.key,
  name: champ.name,
  icon: `https://ddragon.leagueoflegends.com/cdn/${LATEST_PATCH}/img/champion/${champ.id}.png`,
  nicknames: nicknameMap[champ.id] || [],
}));

export default champions;