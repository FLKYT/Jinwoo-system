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
let level = 1;
let exp = 0;
let expNeeded = 1000;
let rank = "E Hunter";
let hp = 100;
let str = 10;

function updateUI() {
  document.getElementById("level").textContent = level;
  document.getElementById("rank").textContent = rank;
  document.getElementById("exp").textContent = exp;
  document.getElementById("expNeeded").textContent = expNeeded;
  document.getElementById("hp").textContent = hp;
  document.getElementById("str").textContent = str;

  document.getElementById("expBar").style.width = (exp / expNeeded * 100) + "%";
  document.getElementById("hpBar").style.width = hp + "%";
  document.getElementById("strBar").style.width = str + "%";
}

updateUI();
// Player stats
let level = 1, exp = 0, expNeeded = 1000, rank = "E Hunter";
let hp = 100, str = 10;
let inventory = [];

// Task sets
const taskSets = [
  ["100 pushups", "100 sit-ups", "5km run", "30 mins reading", "30 mins meditation"],
  ["10 pushups", "10 sit-ups", "500m run", "10 mins reading", "10 mins meditation"],
  ["50 pushups", "50 sit-ups", "2km run", "50 mins reading", "50 mins meditation"],
  ["20 pushups", "20 sit-ups", "10km run", "25 mins reading", "20 mins meditation"],
  ["150 pushups", "150 sit-ups", "5km run", "20 mins reading", "25 mins meditation"]
];

let activeTasks = [];
let taskDeadline = null; // store time limit

// UI updater
function updateUI() {
  document.getElementById("level").textContent = level;
  document.getElementById("rank").textContent = rank;
  document.getElementById("exp").textContent = exp;
  document.getElementById("expNeeded").textContent = expNeeded;
  document.getElementById("hp").textContent = hp;
  document.getElementById("str").textContent = str;

  document.getElementById("expBar").style.width = (exp / expNeeded * 100) + "%";
  document.getElementById("hpBar").style.width = hp + "%";
  document.getElementById("strBar").style.width = str + "%";

  let invList = document.getElementById("items");
  invList.innerHTML = "";
  inventory.forEach(i => {
    let li = document.createElement("li");
    li.textContent = i;
    invList.appendChild(li);
  });

  // Show countdown if tasks are active
  if (taskDeadline) {
    let now = new Date().getTime();
    let diff = taskDeadline - now;
    if (diff > 0) {
      let hrs = Math.floor(diff / (1000 * 60 * 60));
      let mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      document.getElementById("tasks").innerHTML += `<p>⏳ Time left: ${hrs}h ${mins}m</p>`;
    }
  }
}

// Ranks logic
function updateRank() {
  if (level <= 10) rank = "E Hunter";
  else if (level <= 30) rank = "D Hunter";
  else if (level <= 50) rank = "C Hunter";
  else if (level <= 70) rank = "B Hunter";
  else if (level <= 100) rank = "A Hunter";
  else if (level <= 120) rank = "S Hunter";
  else rank = "Shadow Monarch";
}

// EXP system
function gainEXP(amount) {
  exp += amount;
  if (exp >= expNeeded) {
    exp -= expNeeded;
    level++;
    updateRank();
    expNeeded = Math.floor(expNeeded * 1.2);

    // gift box reward
    if (level >= 15 && (level % 5 === 0 || level % 10 === 0)) {
      inventory.push("Gift Box");
    }
  }
  updateUI();
}

function loseEXP(amount) {
  exp -= amount;
  if (exp < 0) exp = 0;
  updateUI();
}

// Task system
function startTasks() {
  activeTasks = taskSets[Math.floor(Math.random() * taskSets.length)];
  let taskDiv = document.getElementById("tasks");
  taskDiv.innerHTML = "<ul>" + activeTasks.map(t => `<li>${t}</li>`).join("") + "</ul>";
  document.getElementById("startBtn").classList.add("hidden");

  // 24h deadline in Dhaka time
  let now = new Date();
  taskDeadline = now.getTime() + (24 * 60 * 60 * 1000);

  localStorage.setItem("taskDeadline", taskDeadline); // save so it persists
  localStorage.setItem("hasActiveTasks", "true");

  updateUI();
}

function completeTasks() {
  let reward = 100; // base EXP
  gainEXP(reward * activeTasks.length);
  document.getElementById("tasks").innerHTML = "✅ Tasks completed!";
  document.getElementById("completeBtn").classList.add("hidden");
  document.getElementById("startBtn").classList.remove("hidden");

  localStorage.removeItem("taskDeadline");
  localStorage.setItem("hasActiveTasks", "false");
  taskDeadline = null;
}

// Penalty checker
function checkPenalty() {
  let savedDeadline = localStorage.getItem("taskDeadline");
  if (savedDeadline) {
    taskDeadline = parseInt(savedDeadline);
    let now = new Date().getTime();
    if (now > taskDeadline) {
      loseEXP(200); // penalty
      document.getElementById("tasks").innerHTML = "❌ You failed the daily tasks. -200 EXP penalty!";
      document.getElementById("completeBtn").classList.add("hidden");
      document.getElementById("startBtn").classList.remove("hidden");
      localStorage.removeItem("taskDeadline");
      localStorage.setItem("hasActiveTasks", "false");
      taskDeadline = null;
    }
  }
}

// Inventory toggle
document.getElementById("inventoryBtn").addEventListener("click", () => {
  document.getElementById("inventory").classList.toggle("hidden");
});

document.getElementById("startBtn").addEventListener("click", startTasks);
document.getElementById("completeBtn").addEventListener("click", completeTasks);

// run penalty check every minute
setInterval(checkPenalty, 60000);

updateUI();
