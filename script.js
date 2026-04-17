/** @format */

let state = {
  title: "Redesign the Kookietng order page",
  description:
    "Update the product cards layout, add a quantity selector, and improve mobile responsiveness before the April promo launch. This includes refactoring the grid system, updating the colour tokens to match the new brand guidelines, and making sure all interactive elements meet WCAG AA contrast ratios. Coordinate with the backend team for the new cart API endpoint changes.",
  priority: "High",
  dueDate: new Date("2026-05-01T23:59:00"),
  status: "Pending",
  done: false,
};
let savedState = { ...state };
const COLLAPSE_THRESHOLD = 120; // chars

// ─────────────────────────────────────────────
//  ELEMENTS
// ─────────────────────────────────────────────
const card = document.getElementById("todo-card");
const titleEl = document.getElementById("todo-title");
const descEl = document.getElementById("todo-description");
const priorityBadge = document.getElementById("priority-badge");
const statusBadge = document.getElementById("status-badge");
const overdueEl = document.getElementById("overdue-indicator");
const timeEl = document.getElementById("time-remaining");
const dueDateEl = document.getElementById("due-date-display");
const priorityBar = document.getElementById("priority-indicator");
const checkbox = document.querySelector(
  '[data-testid="test-todo-complete-toggle"]',
);
const statusControl = document.getElementById("status-control");
const expandToggle = document.getElementById("expand-toggle");
const expandLabel = document.getElementById("expand-label");
const expandIcon = document.getElementById("expand-icon");
const collapsible = document.getElementById("collapsible-section");
const editForm = document.getElementById("edit-form");
const editBtn = document.getElementById("edit-btn");

// ─────────────────────────────────────────────
//  RENDER
// ─────────────────────────────────────────────
function render() {
  const { title, description, priority, dueDate, status, done } = state;

  // Title & description
  titleEl.textContent = title;
  descEl.textContent = description;

  // Done state
  card.classList.toggle("card-done", done);

  // Priority badge + bar
  const pLow = priority === "Low",
    pMed = priority === "Medium",
    pHigh = priority === "High";
  priorityBadge.className = `badge ${pLow ? "low" : pMed ? "medium" : "high"}`;
  priorityBadge.textContent = pLow ? "🟢 Low" : pMed ? "🟡 Medium" : "🔴 High";
  priorityBadge.setAttribute("aria-label", `Priority: ${priority}`);
  priorityBar.className = pLow ? "low" : pMed ? "medium" : "high";

  // Status badge
  const sMap = {
    Pending: ["pending", "⏳"],
    "In Progress": ["progress", "🔄"],
    Done: ["done", "✅"],
  };
  const [sCls, sEmoji] = sMap[status] || sMap["Pending"];
  statusBadge.className = `badge ${sCls}`;
  statusBadge.textContent = `${sEmoji} ${status}`;
  statusBadge.setAttribute("aria-label", `Status: ${status}`);

  // Status control sync
  statusControl.value = status;

  // Checkbox sync
  checkbox.checked = done;

  // Due date display
  dueDateEl.textContent = formatDueDate(dueDate);
  dueDateEl.setAttribute("datetime", dueDate.toISOString());

  // Collapse if description long
  setupCollapse();

  // Time remaining
  updateTime();
}

function formatDueDate(d) {
  return d
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .replace(",", "");
}

// ─────────────────────────────────────────────
//  TIME REMAINING
// ─────────────────────────────────────────────
function updateTime() {
  if (state.done) {
    timeEl.textContent = "Completed";
    timeEl.className = "complete";
    overdueEl.classList.remove("visible");
    card.classList.remove("card-overdue");
    return;
  }

  const now = new Date();
  const diff = state.dueDate - now;
  const abs = Math.abs(diff);
  const mins = Math.floor(abs / 60000);
  const hours = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);

  let text, cls;

  if (diff < 0) {
    // Overdue
    if (mins < 60) text = `Overdue by ${mins}m`;
    else if (hours < 24) text = `Overdue by ${hours}h`;
    else text = `Overdue by ${days}d`;
    cls = "overdue";
    overdueEl.classList.add("visible");
    card.classList.add("card-overdue");
  } else {
    overdueEl.classList.remove("visible");
    card.classList.remove("card-overdue");
    if (mins < 5) {
      text = "Due now!";
      cls = "overdue";
    } else if (mins < 60) {
      text = `Due in ${mins} min`;
      cls = "soon";
    } else if (hours < 24) {
      text = `Due in ${hours}h`;
      cls = "soon";
    } else if (days === 1) {
      text = "Due tomorrow";
      cls = "soon";
    } else {
      text = `Due in ${days} days`;
      cls = "safe";
    }
  }

  timeEl.textContent = text;
  timeEl.className = cls;
}

setInterval(() => {
  if (!state.done) updateTime();
}, 30000);

// ─────────────────────────────────────────────
//  COLLAPSE
// ─────────────────────────────────────────────
let isExpanded = false;

function setupCollapse() {
  const long = state.description.length > COLLAPSE_THRESHOLD;
  expandToggle.style.display = long ? "inline-flex" : "none";
  if (!long) {
    collapsible.classList.add("expanded");
    expandToggle.setAttribute("aria-expanded", "true");
  } else if (!isExpanded) {
    collapsible.classList.remove("expanded");
    expandToggle.setAttribute("aria-expanded", "false");
    expandLabel.textContent = "Show more";
    expandIcon.classList.remove("open");
  }
}

function toggleExpand() {
  isExpanded = !isExpanded;
  collapsible.classList.toggle("expanded", isExpanded);
  expandToggle.setAttribute("aria-expanded", String(isExpanded));
  expandLabel.textContent = isExpanded ? "Show less" : "Show more";
  expandIcon.classList.toggle("open", isExpanded);
}

// ─────────────────────────────────────────────
//  STATUS & CHECKBOX
// ─────────────────────────────────────────────
function onCheckboxChange(cb) {
  state.done = cb.checked;
  state.status = cb.checked ? "Done" : "Pending";
  render();
}

function onStatusChange(val) {
  state.status = val;
  state.done = val === "Done";
  render();
}

// ─────────────────────────────────────────────
//  EDIT MODE
// ─────────────────────────────────────────────
function openEditMode() {
  savedState = { ...state };

  // Pre-fill form
  document.getElementById("edit-title").value = state.title;
  document.getElementById("edit-description").value = state.description;
  document.getElementById("edit-priority").value = state.priority;

  // Format datetime-local value
  const d = state.dueDate;
  const pad = (n) => String(n).padStart(2, "0");
  const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  document.getElementById("edit-due-date").value = local;

  editForm.classList.add("active");
  editBtn.setAttribute("aria-expanded", "true");
  document.getElementById("edit-title").focus();
}

function saveEdit(e) {
  e.preventDefault();
  const rawDate = document.getElementById("edit-due-date").value;
  state.title =
    document.getElementById("edit-title").value.trim() || state.title;
  state.description = document.getElementById("edit-description").value.trim();
  state.priority = document.getElementById("edit-priority").value;
  if (rawDate) state.dueDate = new Date(rawDate);

  closeEditMode();
  isExpanded = false;
  render();
}

function cancelEdit() {
  state = { ...savedState };
  closeEditMode();
}

function closeEditMode() {
  editForm.classList.remove("active");
  editBtn.setAttribute("aria-expanded", "false");
  editBtn.focus();
}

render();
