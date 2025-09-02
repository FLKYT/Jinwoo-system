const RANKS = [
  { name: "E Hunter", min: 1, max: 10, exp: 100, penalty: 50 },
  { name: "D Hunter", min: 11, max: 30, exp: 150, penalty: 50 },
  { name: "C Hunter", min: 31, max: 50, exp: 200, penalty: 50 },
  { name: "B Hunter", min: 51, max: 70, exp: 300, penalty: 200 },
  { name: "A Hunter", min: 71, max: 100, exp: 500, penalty: 200 },
  { name: "S Hunter", min: 101, max: 150, exp: 700, penalty: 300 },
  { name: "Shadow Monarch", min: 151, max: 9999, exp: 1000, penalty: 500 },
];

let player = {
  level: 1,
  exp: 0,
  hp: 100,
  str: 10,
  inventory: []
};

function getRank(level) {
  return RANKS.find(r => level >= r.min && level <= r.max);
}

function addExp(amount) {
  player.exp += amount;
  while (player.exp >= getNextLevelExp(player.level)) {
    player.level++;
  }
}

function getNextLevelExp(level) {
  return 500 + (level - 1) * 100;
}

export { player, getRank, addExp };
