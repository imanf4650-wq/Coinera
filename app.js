// =============================
// Coinera WebApp - LocalStorage Backend
// =============================

// Users data (localStorage DB)
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let events = JSON.parse(localStorage.getItem("events")) || [];

// Utility: save to localStorage
function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  localStorage.setItem("events", JSON.stringify(events));
}

// =============================
// Signup
// =============================
function signup(username, email, password) {
  if (users.find(u => u.email === email)) {
    alert("❌ Email already registered!");
    return;
  }
  let newUser = {
    username,
    email,
    password,
    balance: 0,
    plan: "Free",
    referrals: [],
    referralCode: email.split("@")[0] + Date.now(),
    commissionEarned: 0
  };
  users.push(newUser);
  saveData();
  alert("✅ Signup successful! Please login.");
}

// =============================
// Login
// =============================
function login(email, password) {
  let user = users.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = user;
    saveData();
    alert("✅ Welcome " + user.username);
    updateUI();
  } else {
    alert("❌ Invalid credentials!");
  }
}

// Logout
function logout() {
  currentUser = null;
  saveData();
  updateUI();
}

// =============================
// Deposit
// =============================
function deposit(amount) {
  if (!currentUser) return alert("Login first!");
  amount = parseFloat(amount);
  if (amount <= 0) return alert("Invalid deposit amount!");

  currentUser.balance += amount;
  events.push({ type: "Deposit", user: currentUser.email, amount, date: new Date() });

  // Commission (10%)
  let commission = amount * 0.1;
  currentUser.balance -= commission;
  currentUser.commissionEarned += commission;

  saveData();
  alert("✅ Deposit successful! Commission deducted: " + commission);
  updateUI();
}

// =============================
// Withdraw
// =============================
function withdraw(amount) {
  if (!currentUser) return alert("Login first!");
  amount = parseFloat(amount);
  if (amount <= 0 || amount > currentUser.balance) return alert("Invalid withdraw amount!");

  currentUser.balance -= amount;
  events.push({ type: "Withdraw", user: currentUser.email, amount, date: new Date() });

  // Commission (5%)
  let commission = amount * 0.05;
  currentUser.balance -= commission;
  currentUser.commissionEarned += commission;

  saveData();
  alert("✅ Withdraw request placed! Commission deducted: " + commission);
  updateUI();
}

// =============================
// Buy Plan
// =============================
function buyPlan(plan, cost, speed) {
  if (!currentUser) return alert("Login first!");
  if (currentUser.balance < cost) return alert("Not enough balance!");

  currentUser.balance -= cost;
  currentUser.plan = plan;
  currentUser.miningSpeed = speed;
  events.push({ type: "Buy Plan", user: currentUser.email, plan, cost, date: new Date() });

  saveData();
  alert("✅ Plan activated: " + plan);
  updateUI();
}

// =============================
// Referral System
// =============================
function useReferral(referralCode) {
  let refUser = users.find(u => u.referralCode === referralCode);
  if (refUser && currentUser && currentUser.email !== refUser.email) {
    refUser.referrals.push(currentUser.email);
    let bonus = 50;
    refUser.balance += bonus;
    events.push({ type: "Referral Bonus", user: refUser.email, bonus, date: new Date() });
    saveData();
    alert("✅ Referral applied!");
  }
}

// =============================
// Mining Engine
// =============================
setInterval(() => {
  if (currentUser && currentUser.miningSpeed) {
    currentUser.balance += currentUser.miningSpeed;
    events.push({ type: "Mining", user: currentUser.email, amount: currentUser.miningSpeed, date: new Date() });
    saveData();
    updateUI();
  }
}, 10000); // every 10 sec

// =============================
// Event Log Render
// =============================
function renderEvents() {
  let eventDiv = document.getElementById("eventsLog");
  if (!eventDiv) return;
  eventDiv.innerHTML = "";
  events.slice(-20).reverse().forEach(ev => {
    eventDiv.innerHTML += `<p>[${ev.date}] ${ev.user} → ${ev.type} (${ev.amount || ev.plan || ev.bonus})</p>`;
  });
}

// =============================
// Update UI
// =============================
function updateUI() {
  if (currentUser) {
    document.getElementById("welcome").innerText = "Welcome " + currentUser.username;
    document.getElementById("balance").innerText = "Balance: " + currentUser.balance;
    document.getElementById("plan").innerText = "Plan: " + currentUser.plan;
    document.getElementById("referralCode").innerText = "Referral Code: " + currentUser.referralCode;
    renderEvents();
  }
}
