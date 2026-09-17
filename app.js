const people = [
  { name: "Lukas", initials: "LS", color: "#b8dd42", score: "6 Siege" },
  { name: "Mia", initials: "MI", color: "#ff9b82", score: "72% richtig" },
  { name: "Ben", initials: "BE", color: "#9c83ee", score: "8 verloren" },
  { name: "Noah", initials: "NO", color: "#7fcfd0", score: "5 Dares" },
  { name: "Finn", initials: "FI", color: "#ffd45f", score: "5 Siege" },
  { name: "Emma", initials: "EM", color: "#ef9ec4", score: "67% richtig" }
];

const seedBets = [
  { id: 1, type: "PRE", title: "Kommt Ben am Freitag wieder mehr als 15 Minuten zu spät?", target: "Ben", stake: "Bei JA bringt Ben nächstes Mal Snacks mit.", deadline: "2026-09-18", votes: { yes: 4, no: 1 }, voters: ["LS","MI","NO","FI","EM"], status: "active" },
  { id: 2, type: "DAR", title: "Noah tritt beim nächsten Spieleabend mit Zaubererhut an.", target: "Noah", stake: "Der Hut bleibt den ganzen Abend auf – ohne Ausreden.", deadline: "2026-10-31", votes: { yes: 3, no: 1 }, voters: ["NO","LS","BE","MI"], status: "active" },
  { id: 3, type: "DAR", title: "Wer beim Mario Kart als Letztes ins Ziel kommt …", target: "Alle", stake: "… schickt eine dramatische Entschuldigung als Sprachnachricht.", deadline: "2026-09-20", votes: { yes: 5, no: 0 }, voters: ["LS","MI","BE","NO","FI"], status: "active" },
  { id: 4, type: "PRE", title: "Schreibt Lukas die RE-Klausur besser als 2,0?", target: "Lukas", stake: "Der Verlierer plant den nächsten Spieleabend.", deadline: "2026-09-28", votes: { yes: 5, no: 1 }, voters: ["MI","BE","NO","FI","EM"], status: "active" },
  { id: 5, type: "DAR", title: "Beim Bowling verliert Ben mit mehr als 20 Punkten Abstand.", target: "Ben", stake: "Er erschien beim nächsten Treffen mit Krawatte.", deadline: "2026-08-29", votes: { yes: 4, no: 2 }, voters: ["LS","MI","BE","NO","FI","EM"], status: "done", result: "Eingelöst ✓" },
  { id: 6, type: "PRE", title: "Finn vergisst beim Campen mindestens eine wichtige Sache.", target: "Finn", stake: "Es war natürlich die Taschenlampe.", deadline: "2026-07-17", votes: { yes: 5, no: 1 }, voters: ["LS","MI","BE","NO"], status: "done", result: "JA · 5 richtig" }
];

const colors = { PRE: "#ff6846", DAR: "#9c83ee" };
const labels = { PRE: "Prediction", DAR: "Dare" };
let bets = loadBets();
let currentFilter = "ALL";
let selectedType = "PRE";

function loadBets() {
  try {
    const stored = JSON.parse(localStorage.getItem("predar-bets-v2"));
    return stored?.filter(bet => bet.type === "PRE" || bet.type === "DAR") || structuredClone(seedBets);
  }
  catch { return structuredClone(seedBets); }
}
function saveBets() { localStorage.setItem("predar-bets-v2", JSON.stringify(bets)); }
function formatDate(date) { return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short" }).format(new Date(date + "T12:00:00")); }
function daysLeft(date) {
  const days = Math.ceil((new Date(date + "T23:59:59") - new Date()) / 86400000);
  return days < 0 ? "überfällig" : days === 0 ? "heute" : days === 1 ? "morgen" : `noch ${days} Tage`;
}
function avatarMarkup(initials) {
  const person = people.find(p => p.initials === initials) || people[0];
  return `<span class="mini-avatar" style="background:${person.color}">${initials}</span>`;
}
function escapeHtml(value) { const div = document.createElement("div"); div.textContent = value; return div.innerHTML; }

function betCard(bet) {
  const total = bet.votes.yes + bet.votes.no || 1;
  const percent = Math.round((bet.votes.yes / total) * 100);
  return `<article class="bet-card" data-id="${bet.id}" style="--accent:${colors[bet.type]}">
    <div class="card-top"><span class="type-badge">${labels[bet.type]}</span><span class="time-left">${bet.status === "done" ? escapeHtml(bet.result || "Beendet") : daysLeft(bet.deadline)}</span></div>
    <h3>${escapeHtml(bet.title)}</h3>
    <div class="stake"><i>◆</i><span>${escapeHtml(bet.stake)}</span></div>
    ${bet.type !== "DAR" ? `<div class="progress"><span style="width:${percent}%"></span></div>` : ""}
    <div class="card-bottom"><div class="mini-avatars">${bet.voters.slice(0,4).map(avatarMarkup).join("")}${bet.voters.length > 4 ? `<span class="mini-avatar" style="background:#ded9cd">+${bet.voters.length-4}</span>` : ""}</div><span class="action-hint">${bet.status === "done" ? "Ansehen" : bet.type === "PRE" ? `${percent}% sagen JA` : `${bet.voters.length} dabei`} →</span></div>
  </article>`;
}

function render() {
  const active = bets.filter(b => b.status === "active" && (currentFilter === "ALL" || b.type === currentFilter));
  const done = bets.filter(b => b.status === "done");
  document.getElementById("activeCount").textContent = bets.filter(b => b.status === "active").length;
  document.getElementById("activeList").innerHTML = active.length ? active.map(betCard).join("") : `<div class="empty"><strong>Hier ist verdächtig wenig los.</strong>Starte die nächste absurde Idee.</div>`;
  document.getElementById("historyList").innerHTML = done.length ? done.map(betCard).join("") : `<div class="empty">Noch nichts für die Geschichtsbücher.</div>`;
  document.getElementById("peopleGrid").innerHTML = people.map(p => `<div class="person"><span class="person-avatar" style="background:${p.color}">${p.initials}</span><span><strong>${p.name}</strong><small>${p.score}</small></span></div>`).join("");
  document.querySelectorAll(".bet-card").forEach(card => card.addEventListener("click", () => openDetail(Number(card.dataset.id))));
}

function openModal(id) { const modal = document.getElementById(id); modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
function closeModal(id) { const modal = document.getElementById(id); modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
function toast(message) { const el = document.getElementById("toast"); el.textContent = message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2300); }

function openDetail(id) {
  const bet = bets.find(b => b.id === id); if (!bet) return;
  const voted = bet.userVote;
  document.getElementById("detailContent").innerHTML = `<div style="--accent:${colors[bet.type]}">
    <span class="detail-type">${labels[bet.type]}</span>
    <h2 class="detail-title" id="detailTitle">${escapeHtml(bet.title)}</h2>
    <div class="detail-meta"><span class="meta-pill">◎ ${escapeHtml(bet.target)}</span><span class="meta-pill">◷ ${formatDate(bet.deadline)}</span><span class="meta-pill">♟ ${bet.voters.length} dabei</span></div>
    <div class="detail-stake"><small>ES GEHT UM</small><strong>${escapeHtml(bet.stake)}</strong></div>
    ${bet.status === "active" ? `<p class="vote-title">${bet.type === "DAR" ? "Bist du dabei?" : "Was glaubst du?"}</p><div class="vote-buttons"><button class="vote-button ${voted === "yes" ? "selected" : ""}" data-vote="yes">${bet.type === "DAR" ? "Bin dabei" : "JA"}</button><button class="vote-button ${voted === "no" ? "selected" : ""}" data-vote="no">${bet.type === "DAR" ? "Bin raus" : "NEIN"}</button></div><div class="detail-actions"><button id="copyBet">Link kopieren</button><button class="resolve" id="resolveBet">Auflösen ✓</button></div>` : `<div class="detail-actions"><button id="copyBet">Moment teilen</button><button class="resolve" disabled>${escapeHtml(bet.result || "Erledigt")}</button></div>`}
  </div>`;
  openModal("detailModal");
  document.querySelectorAll("[data-vote]").forEach(btn => btn.addEventListener("click", () => castVote(id, btn.dataset.vote)));
  document.getElementById("copyBet")?.addEventListener("click", () => shareText(`${bet.type}: ${bet.title}\nEinsatz: ${bet.stake}`));
  document.getElementById("resolveBet")?.addEventListener("click", () => resolveBet(id));
}

function castVote(id, vote) {
  const bet = bets.find(b => b.id === id); if (!bet) return;
  if (bet.userVote && bet.userVote !== vote) bet.votes[bet.userVote] = Math.max(0, bet.votes[bet.userVote] - 1);
  if (bet.userVote !== vote) bet.votes[vote] += 1;
  bet.userVote = vote;
  if (!bet.voters.includes("LS")) bet.voters.push("LS");
  saveBets(); render(); openDetail(id); toast("Deine Antwort steht.");
}

function resolveBet(id) {
  const bet = bets.find(b => b.id === id); if (!bet) return;
  bet.status = "done"; bet.result = bet.type === "DAR" ? "Eingelöst ✓" : "Aufgelöst ✓";
  saveBets(); render(); closeModal("detailModal"); toast("Für immer in der Chronik.");
}

function shareText(text) {
  if (navigator.share) navigator.share({ title: "PRE DAR", text, url: location.href }).catch(() => {});
  else navigator.clipboard?.writeText(`${text}\n${location.href}`).then(() => toast("Link kopiert!"));
}

document.querySelectorAll(".nav-item[data-view]").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active")); button.classList.add("active");
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active")); document.getElementById(button.dataset.view).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}));
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(f => f.classList.remove("active")); button.classList.add("active"); currentFilter = button.dataset.filter; render();
}));
document.getElementById("createButton").addEventListener("click", () => { document.getElementById("typeStep").classList.remove("hidden"); document.getElementById("betForm").classList.add("hidden"); openModal("createModal"); });
document.querySelectorAll("[data-quick-type]").forEach(button => button.addEventListener("click", () => {
  openCreateForm(button.dataset.quickType);
}));
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => closeModal(button.dataset.close)));
document.querySelectorAll(".modal-backdrop").forEach(modal => modal.addEventListener("click", e => { if (e.target === modal) closeModal(modal.id); }));
document.querySelectorAll(".type-option").forEach(option => option.addEventListener("click", () => {
  openCreateForm(option.dataset.type);
}));

function openCreateForm(type) {
  selectedType = type;
  const isPrediction = type === "PRE";
  document.getElementById("typeStep").classList.add("hidden");
  document.getElementById("betForm").classList.remove("hidden");
  const badge = document.getElementById("formType");
  badge.textContent = labels[type].toUpperCase();
  badge.style.background = colors[type];
  document.getElementById("formHeading").textContent = `Neue ${labels[type]}`;
  document.getElementById("formHelper").textContent = isPrediction ? "Stellt eine Frage, die alle mit Ja oder Nein beantworten können." : "Legt eindeutig fest, wer was tun muss – dann kann es keine Ausreden geben.";
  document.getElementById("titleLabel").childNodes[0].textContent = isPrediction ? "Was wollt ihr vorhersagen?\n            " : "Was ist der Dare?\n            ";
  document.getElementById("targetLabel").childNodes[0].textContent = isPrediction ? "Wen betrifft es?\n            " : "Wer muss ran?\n            ";
  document.getElementById("stakeLabel").childNodes[0].textContent = isPrediction ? "Was bekommt die richtige Seite?\n            " : "Welche Regel oder Konsequenz gilt?\n            ";
  document.getElementById("betTitle").placeholder = isPrediction ? "Kommt Ben Freitag wieder zu spät?" : "Beim Spieleabend Karaoke singen";
  document.getElementById("betStake").placeholder = isPrediction ? "Verlierer bringt Snacks mit" : "Das Lied bestimmt die Gruppe";
  openModal("createModal");
}
document.getElementById("backToTypes").addEventListener("click", () => { document.getElementById("typeStep").classList.remove("hidden"); document.getElementById("betForm").classList.add("hidden"); });
document.getElementById("betForm").addEventListener("submit", event => {
  event.preventDefault();
  bets.unshift({ id: Date.now(), type: selectedType, title: document.getElementById("betTitle").value.trim(), target: document.getElementById("betTarget").value, stake: document.getElementById("betStake").value.trim(), deadline: document.getElementById("betDeadline").value, votes: { yes: 0, no: 0 }, voters: [], status: "active" });
  saveBets(); render(); event.target.reset(); closeModal("createModal"); toast(`${selectedType} ist eröffnet!`);
});
document.getElementById("randomButton").addEventListener("click", () => { const active = bets.filter(b => b.status === "active"); if (active.length) openDetail(active[Math.floor(Math.random()*active.length)].id); });
document.getElementById("shareButton").addEventListener("click", () => shareText("Komm in unsere Gruppe „Die Idioten“ und teste PRE DAR."));
document.getElementById("resetButton").addEventListener("click", () => { localStorage.removeItem("predar-bets-v2"); localStorage.removeItem("prechadar-bets"); bets = structuredClone(seedBets); render(); toast("Testdaten sind wieder frisch."); });
document.getElementById("moreButton").addEventListener("click", () => toast("Mehr Chaos kommt nach eurem Test 😈"));
document.getElementById("profileButton").addEventListener("click", () => toast("Du testest als Lukas."));
document.getElementById("groupButton").addEventListener("click", () => document.querySelector('[data-view="groupView"]').click());

document.getElementById("betTarget").innerHTML = people.map(p => `<option>${p.name}</option>`).join("") + `<option>Alle</option>`;
const defaultDeadline = new Date(Date.now() + 7 * 86400000).toISOString().slice(0,10);
document.getElementById("betDeadline").value = defaultDeadline;
document.getElementById("betDeadline").min = new Date().toISOString().slice(0,10);
render();
