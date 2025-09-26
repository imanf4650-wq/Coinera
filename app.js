function signup(username, referrer = null) {
  if (users[username]) {
    alert("User already exists!");
    return;
  }
  users[username] = { balance: 0, plan: "Free", miningSpeed: 1, referrals: [] };
  if (referrer && users[referrer]) {
    users[referrer].referrals.push(username);
    let bonus = 1; // 1 CNR bonus
    users[referrer].balance += bonus;
    logEvent(`${referrer} got referral bonus ${bonus} CNR`);
  }
  saveUsers();
  // ✅ Auto login after signup
  currentUser = username;
  localStorage.setItem("coinera_currentUser", username);
  updateProfile();
  logEvent(`${username} signed up & logged in`);
  alert("Signup successful! You are now logged in.");
}
// -------------------------
// Coinera - app.js
// -------------------------

// Default user data
let users = JSON.parse(localStorage.getItem("coinera_users")) || {};
let currentUser = localStorage.getItem("coinera_currentUser") || null;

let miningInterval;
let miningSpeed = 1;
const commissions = {
  deposit: 0.02,   // 2%
  withdraw: 0.01,  // 1%
  plans: 0.05,     // 5%
  referral: 0.03   // 3%
};

// ----------- UTILITIES ----------
function saveUsers() {
  localStorage.setItem("coinera_users", JSON.stringify(users));
}
function updateProfile() {
  if (!currentUser) return;
  const user = users[currentUser];
  document.getElementById("profile-info").textContent =
    `User: ${currentUser} | Balance: ${user.balance.toFixed(4)} CNR`;
  document.getElementById("mining-balance").textContent =
    `Balance: ${user.balance.toFixed(4)} CNR`;
}
function logEvent(msg) {
  const log = document.getElementById("event-log");
  const li = document.createElement("li");
  li.textContent = msg;
  log.prepend(li);
}

// ----------- AUTH SYSTEM ----------
function signup(username, referrer = null) {
  if (users[username]) {
    alert("User already exists!");
    return;
  }
  users[username] = { balance: 0, plan: "Free", miningSpeed: 1, referrals: [] };
  if (referrer && users[referrer]) {
    users[referrer].referrals.push(username);
    let bonus = 1; // 1 CNR bonus
    users[referrer].balance += bonus;
    logEvent(`${referrer} got referral bonus ${bonus} CNR`);
  }
  saveUsers();
  alert("Signup successful! Please login.");
}

function login(username) {
  if (!users[username]) {
    alert("User not found!");
    return;
  }
  currentUser = username;
  localStorage.setItem("coinera_currentUser", username);
  updateProfile();
  logEvent(`${username} logged in`);
}

// ----------- MINING ----------
function startMining() {
  if (!currentUser) {
    alert("Login first!");
    return;
  }
  clearInterval(miningInterval);
  miningInterval = setInterval(() => {
    let user = users[currentUser];
    let mined = 0.001 * user.miningSpeed;
    user.balance += mined;
    updateProfile();
    let width = Math.min(100, (user.balance % 1) * 100);
    document.getElementById("mining-progress").style.width = width + "%";
    logEvent(`+${mined.toFixed(4)} mined`);
    saveUsers();
  }, 2000);
}

// ----------- DEPOSIT ----------
function deposit() {
  if (!currentUser) { alert("Login first!"); return; }
  const amt = parseFloat(document.getElementById("deposit-amount").value);
  if (amt > 0) {
    let commission = amt * commissions.deposit;
    let finalAmt = amt - commission;
    users[currentUser].balance += finalAmt;
    logEvent(`Deposited ${finalAmt} CNR (commission ${commission.toFixed(2)})`);
    updateProfile();
    saveUsers();
  }
}

// ----------- WITHDRAW ----------
function withdraw() {
  if (!currentUser) { alert("Login first!"); return; }
  const amt = parseFloat(document.getElementById("withdraw-amount").value);
  if (amt > 0 && amt <= users[currentUser].balance) {
    let commission = amt * commissions.withdraw;
    let finalAmt = amt - commission;
    users[currentUser].balance -= amt;
    logEvent(`Withdrew ${finalAmt} CNR (commission ${commission.toFixed(2)})`);
    updateProfile();
    saveUsers();
  }
}

// ----------- BUY PLAN ----------
function buyPlan(plan) {
  if (!currentUser) { alert("Login first!"); return; }
  let user = users[currentUser];
  if (plan === "Silver" && user.balance >= 10) {
    user.balance -= 10;
    user.miningSpeed = 2;
    logEvent("Bought Silver Plan (Speed x2)");
  } else if (plan === "Gold" && user.balance >= 25) {
    user.balance -= 25;
    user.miningSpeed = 5;
    logEvent("Bought Gold Plan (Speed x5)");
  } else if (plan === "Free") {
    user.miningSpeed = 1;
    logEvent("Selected Free Plan (Speed x1)");
  } else {
    logEvent("Not enough balance for this plan");
    return;
  }
  saveUsers();
  updateProfile();
}

// ----------- REFERRAL ----------
function copyRef() {
  if (!currentUser) { alert("Login first!"); return; }
  const refLink = `${window.location.origin}/?ref=${currentUser}`;
  navigator.clipboard.writeText(refLink);
  logEvent("Referral link copied");
}

// ----------- AUTO REF CHECK ----------
window.onload = function () {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    localStorage.setItem("coinera_ref", ref);
    logEvent(`Referral detected: ${ref}`);
  }
  updateProfile();
};
