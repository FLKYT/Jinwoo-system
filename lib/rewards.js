function openGiftBox(player) {
  const roll = Math.random();
  if (roll < 0.05) player.inventory.push("Epic Potion (STR+1 & HP+50)");
  else if (roll < 0.15) player.inventory.push(Math.random()>0.5?"Health Potion +50":"Strength Potion +1");
  else if (roll < 0.25) player.inventory.push("Magical Stone (Skip Task)");
  else player.exp += Math.floor(Math.random()*200)+50;
}
export { openGiftBox };
