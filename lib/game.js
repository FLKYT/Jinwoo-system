// lib/game.js
// Core game logic for Jinwoo Shadow System (browser-friendly, attaches to window.Game)

(function () {
  const KEY = 'jinwoo_game_state_v1';

  // Rank definitions (level ranges, base reward per task, penalty per missed task)
  const RANKS = [
    { id: 'E',   name: 'E Rank', min: 1,   max: 10,  baseReward: 100, penalty: 50 },
    { id: 'D',   name: 'D Rank', min: 11,  max: 30,  baseReward: 150, penalty: 50 },
    { id: 'C',   name: 'C Rank', min: 31,  max: 50,  baseReward: 200, penalty: 50 },
    { id: 'B',   name: 'B Rank', min: 51,  max: 70,  baseReward: 300, penalty: 200 },
    { id: 'A',   name: 'A Rank', min: 71,  max: 100, baseReward: 500, penalty: 200 },
    { id: 'S',   name: 'S Rank', min: 101, max: 150, baseReward: 700, penalty: 300 },
    { id: 'SM',  name: 'Shadow Monarch', min: 151, max: 999999, baseReward: 1000, penalty: 500 }
  ];

  function getRankByLevel(level) {
    return RANKS.find(r => level >= r.min && level <= r.max) || RANKS[0];
  }

  // EXP required to go from level -> level+1
  function expToNextLevel(level) {
    return 500 + (level - 1) * 100;
  }

  // reward per task takes STR into account (+1% per STR point)
  function rewardPerTask(level, str) {
    const r = getRankByLevel(level);
    const base = r.baseReward;
    const bonus = Math.floor(base * (str * 0.01));
    return base + bonus;
  }

  function penaltyPerMiss(level) {
    return getRankByLevel(level).penalty;
  }

  // Gift milestone rules:
  // - First gift = level 15
  // - Next every 5 levels until level 30 (20,25,30)
  // - After level 30, every 10 levels (40,50,...)
  function isGiftMilestone(levelReached) {
    if (levelReached === 15) return true;
    if (levelReached > 15 && levelReached <= 30 && (levelReached - 15) % 5 === 0) return true;
    if (levelReached > 30 && (levelReached - 30) % 10 === 0) return true;
    return false;
  }

  // Dhaka date-key helper (YYYY-MM-DD in Dhaka timezone)
  function todayDateKeyDhaka() {
    try {
      // en-CA gives YYYY-MM-DD format
      return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
    } catch (e) {
      // fallback to local date if timezone not supported
      const d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }
  }

  // default game state
  function defaultState() {
    return {
      level: 1,
      expInLevel: 0,      // EXP accumulated toward next level
      hp: 100,            // total HP (used as shield against penalties)
      str: 0,             // strength points
      stones: 0,          // magical stones (skip tasks)
      gifts: 0,           // gift boxes
      lastDayKey: todayDateKeyDhaka(),
      startedAt: null,    // ms timestamp when start button pressed
      completedToday: false,
      tasks: ['pending','pending','pending','pending','pending'], // 5 tasks
      catIndex: 0,        // which category is selected (other file may set)
      tasksDoneCount: 0,  // total tasks completed ever
      achievements: { tasksCompleted: 0, potionsUsed: 0, giftsOpened: 0 }
    };
  }

  // Local storage helpers
  function loadState() {
    if (typeof localStorage === 'undefined') return defaultState();
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      // migration: ensure minimal fields
      return Object.assign(defaultState(), parsed);
    } catch (e) {
      return defaultState();
    }
  }

  function saveState(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }

  // Add/subtract EXP with level up/down and gift awarding
  function addExp(state, delta) {
    const s = deepCopy(state);
    let d = Math.trunc(delta);
    if (d === 0) return s;

    if (d > 0) {
      while (d > 0) {
        const need = expToNextLevel(s.level) - s.expInLevel;
        if (d >= need) {
          d -= need;
          s.level += 1;
          s.expInLevel = 0;
          // award gift if milestone
          if (isGiftMilestone(s.level)) {
            s.gifts = (s.gifts || 0) + 1;
          }
        } else {
          s.expInLevel += d;
          d = 0;
        }
      }
    } else { // negative
      while (d < 0) {
        if (s.expInLevel > 0) {
          const take = Math.min(s.expInLevel, -d);
          s.expInLevel -= take;
          d += take;
        } else if (s.level > 1) {
          s.level -= 1;
          s.expInLevel = Math.max(0, expToNextLevel(s.level) - 1); // set near top
        } else {
          // at level 1 and no EXP left
          d = 0;
          s.expInLevel = 0;
        }
      }
    }
    return s;
  }

  // Apply penalty but consume HP first (HP acts like shield)
  function applyPenaltyWithHP(state, penalty) {
    const s = deepCopy(state);
    let p = Math.trunc(penalty);
    const hpUse = Math.min(s.hp, p);
    s.hp -= hpUse;
    p -= hpUse;
    if (p > 0) {
      return addExp(s, -p);
    }
    return s;
  }

  // Utility: deep copy simple object
  function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }

  // Helper for marking task done/skip/missed and computing daily totals
  function completeTasksAndApply(state) {
    // Count done/skipped/pending
    const s = deepCopy(state);
    const doneCount = s.tasks.filter(t => t === 'done').length + s.tasks.filter(t => t === 'skipped').length;
    const missedCount = s.tasks.filter(t => t === 'pending' || t === 'missed').length;
    // award EXP for done tasks (skipped gives no penalty and counts as done)
    const per = rewardPerTask(s.level, s.str);
    const gain = per * doneCount;
    let result = addExp(s, gain);
    result.achievements.tasksCompleted = (result.achievements.tasksCompleted || 0) + doneCount;
    result.tasksDoneCount = (result.tasksDoneCount || 0) + doneCount;
    // penalty for missed (use HP first)
    if (missedCount > 0) {
      const pen = penaltyPerMiss(s.level) * missedCount;
      result = applyPenaltyWithHP(result, pen);
    }
    result.completedToday = true;
    result.startedAt = null;
    return result;
  }

  // Reset daily tasks for new day
  function newDayReset(state, newCatIndex) {
    const s = deepCopy(state);
    s.lastDayKey = todayDateKeyDhaka();
    s.startedAt = null;
    s.completedToday = false;
    s.tasks = ['pending','pending','pending','pending','pending'];
    if (typeof newCatIndex === 'number') s.catIndex = newCatIndex;
    return s;
  }

  // Simple API to expose
  const API = {
    getRankByLevel,
    expToNextLevel,
    rewardPerTask,
    penaltyPerMiss,
    isGiftMilestone,
    todayDateKeyDhaka,
    defaultState,
    loadState,
    saveState,
    addExp,
    applyPenaltyWithHP,
    completeTasksAndApply,
    newDayReset,
    // handy test function: returns state snapshot
    snapshot: function () {
      return deepCopy(loadState());
    },
    // reset full save (useful during testing)
    resetAll: function () {
      const s = defaultState();
      saveState(s);
      return s;
    },
    // small helper to compute seconds until Dhaka 23:59:59 (approx)
    secondsUntilDhaka2359: function() {
      try {
        const nowDhaka = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
        const d = new Date(nowDhaka);
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
        return Math.max(0, Math.floor((end - d) / 1000));
      } catch (e) { return 0; }
    }
  };

  // attach to window
  if (typeof window !== 'undefined') {
    window.Game = API;
    // on first load ensure there's a saved state
    if (!localStorage.getItem(KEY)) {
      saveState(defaultState());
    }
  }

})();
