/** @format */

const DUE_DATE = new Date("2026-04-16T23:59:00");

function getTimeRemaining() {
  const now = new Date();
  const diff = DUE_DATE - now; // ms
  const abs = Math.abs(diff);

  const mins = Math.floor(abs / 60000);
  const hours = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);

  if (diff < 0) {
    // Overdue
    if (mins < 60) return { text: `Overdue by ${mins}m`, cls: "overdue" };
    if (hours < 24) return { text: `Overdue by ${hours}h`, cls: "overdue" };
    return { text: `Overdue by ${days}d`, cls: "overdue" };
  }
  if (mins < 5) return { text: "Due now!", cls: "overdue" };
  if (mins < 60) return { text: `Due in ${mins} min`, cls: "soon" };
  if (hours < 24) return { text: `Due in ${hours}h`, cls: "soon" };
  if (days === 1) return { text: "Due tomorrow", cls: "soon" };
  return { text: `Due in ${days} days`, cls: "safe" };
}

function updateTimeRemaining() {
  const el = document.getElementById("time-remaining");
  const { text, cls } = getTimeRemaining();
  el.textContent = text;
  el.className = cls;
}

updateTimeRemaining();
setInterval(updateTimeRemaining, 60000);

// ── Checkbox toggle ──
function toggleComplete(checkbox) {
  const card = checkbox.closest("section");
  const status = document.getElementById("status-badge");

  if (checkbox.checked) {
    card.classList.add("card-done");
    status.textContent = "Done";
    status.className = "badge done";
    status.dataset.testid = "test-todo-status";
    status.setAttribute("aria-label", "Status: Done");
  } else {
    card.classList.remove("card-done");
    status.textContent = "Pending";
    status.className = "badge pending";
    status.setAttribute("aria-label", "Status: Pending");
  }
}
