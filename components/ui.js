import { player, getRank } from "../lib/game.js";

function updateUI() {
  document.getElementById("level").innerText = "Level: " + player.level;
  document.getElementById("rank").innerText = "Rank: " + getRank(player.level).name;
  document.getElementById("exp").innerText = "EXP: " + player.exp;
  document.getElementById("hp-bar").style.width = player.hp + "%";
  document.getElementById("str-bar").style.width = player.str + "%";
  document.getElementById("inventory").innerText = "Inventory: " + player.inventory.join(", ");
}
export { updateUI };
