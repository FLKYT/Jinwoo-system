const TASK_SETS = [
  ["100 pushups","100 sit-ups","5km run","30min reading","30min meditation"],
  ["10 pushups","10 sit-ups","5m run","10min reading","10min meditation"],
  ["50 pushups","50 sit-ups","2km run","50min reading","50min meditation"],
  ["20 pushups","20 sit-ups","10km run","25min reading","20min meditation"],
  ["150 pushups","150 sit-ups","5km run","20min reading","25min meditation"]
];

function getRandomTaskSet() {
  return TASK_SETS[Math.floor(Math.random()*TASK_SETS.length)];
}

export { getRandomTaskSet };
