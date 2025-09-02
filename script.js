import { player, addExp, getRank } from "./lib/game.js";
import { getRandomTaskSet } from "./lib/tasks.js";
import { openGiftBox } from "./lib/rewards.js";
import { updateUI } from "./components/ui.js";
import { chatAI } from "./components/ai.js";

document.getElementById("start-task").addEventListener("click", () => {
  chatAI("Daily task started...");
  setTimeout(() => {
    document.getElementById("complete-task").disabled = false;
    chatAI("You can now complete your task!");
  }, 1200000); // 20 minutes
});

document.getElementById("complete-task").addEventListener("click", () => {
  const rank = getRank(player.level);
  addExp(rank.exp);
  chatAI("Task complete! +" + rank.exp + " EXP");
  updateUI();
  document.getElementById("complete-task").disabled = true;
});

updateUI();
