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
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const completeBtn = document.getElementById("completeBtn");

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      alert("Daily Task Started!");
      startBtn.style.display = "none";
      setTimeout(() => {
        completeBtn.style.display = "inline-block";
      }, 20000); // show after 20 sec
    });
  }

  if (completeBtn) {
    completeBtn.addEventListener("click", () => {
      alert("Task Completed! +100 EXP");
      completeBtn.style.display = "none";
      startBtn.style.display = "inline-block";
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const inventoryBtn = document.getElementById("inventoryBtn");
  const inventoryPanel = document.getElementById("inventoryPanel");
  const closeInventory = document.getElementById("closeInventory");

  if (inventoryBtn && inventoryPanel) {
    inventoryBtn.addEventListener("click", () => {
      inventoryPanel.style.display = "block";
    });
  }

  if (closeInventory) {
    closeInventory.addEventListener("click", () => {
      inventoryPanel.style.display = "none";
    });
  }
});
