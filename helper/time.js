export function timeToPercent(time) {
  if (!time || typeof time !== "string") return null;

  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;

  const minutes = h * 60 + m;
  const start = 9 * 60;
  const end = 18 * 60;

  if (minutes <= start) return 0;
  if (minutes >= end) return 100;

  return ((minutes - start) / (end - start)) * 100;
}

export function nowToPercent() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = 9 * 60;
  const end = 18 * 60;

  if (minutes <= start) return 0;
  if (minutes >= end) return 100;

  return ((minutes - start) / (end - start)) * 100;
}

export function diffTime(start) {
  const [h, m] = start.split(":").map(Number);
  const startMin = h * 60 + m;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const diff = Math.max(0, nowMin - startMin);
  const hh = String(Math.floor(diff / 60)).padStart(2, "0");
  const mm = String(diff % 60).padStart(2, "0");

  return `${hh}:${mm}`;
}
