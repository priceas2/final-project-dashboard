/*******************************
 * API BASE URL (IMPORTANT)
 *******************************/
const API_URL = "http://localhost:3000/api/items"; // change after deployment

/*******************************
 * Helpers
 *******************************/
function setMessage(el, text, type = "info") {
  el.textContent = text;
  el.className = "message " + type;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/*******************************
 * Global State
 *******************************/
let favoriteUsers = new Set();

/*******************************
 * Activity Log
 *******************************/
const activityLog = (() => {
  let activities = [];
  let saved = "";

  return {
    add(text, type = "custom") {
      if (!text.trim()) return false;
      activities.unshift({
        id: Date.now(),
        text,
        type,
        createdAt: new Date()
      });
      return true;
    },
    get(filter, sort) {
      let list = [...activities];

      if (filter !== "all") {
        list = list.filter(a => a.type === filter);
      }

      if (sort === "newest") list.sort((a,b)=>b.id-a.id);
      if (sort === "oldest") list.sort((a,b)=>a.id-b.id);
      if (sort === "alpha") list.sort((a,b)=>a.text.localeCompare(b.text));

      return list;
    },
    stats() {
      return { total: activities.length };
    },
    clear() { activities = []; },
    save() { saved = JSON.stringify(activities); },
    load() {
      if (!saved) return false;
      activities = JSON.parse(saved);
      return true;
    }
  };
})();

/*******************************
 * Render Activities
 *******************************/
function renderActivities() {
  const list = document.getElementById("activityList");
  const stats = document.getElementById("activityStats");

  const filter = document.getElementById("filterSelect").value;
  const sort = document.getElementById("sortSelect").value;

  const items = activityLog.get(filter, sort);

  list.innerHTML = items.map(a => `
    <li class="activity-item">
      ${a.text}
      <button onclick="this.parentElement.remove()">✖</button>
    </li>
  `).join("");

  stats.textContent = `Total: ${items.length}`;
}

/*******************************
 * FETCH USERS (UPDATED)
 *******************************/
async function fetchUsers() {
  const msg = document.getElementById("apiMessage");
  const list = document.getElementById("usersList");

  setMessage(msg, "Loading data...", "info");
  list.innerHTML = "";

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error();

    const users = await res.json();

    list.innerHTML = users.map(u => `
      <li class="activity-item">
        <strong>${u.name}</strong>

        <div class="user-buttons">
          <button class="details-btn" data-id="${u.id}">Details</button>
          <button class="fav-btn" data-id="${u.id}">
            ${favoriteUsers.has(u.id) ? "★ Favorited" : "☆ Favorite"}
          </button>
        </div>

        <div class="hidden" id="details-${u.id}">
          <p>${u.email}</p>
        </div>
      </li>
    `).join("");

    setMessage(msg, "Loaded successfully ✅", "success");

  } catch {
    setMessage(msg, "Error loading data", "error");
  }
}

/*******************************
 * POST USER (NEW)
 *******************************/
async function addUser(name, email) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email })
    });

    fetchUsers(); // refresh list
  } catch {
    alert("Error adding user");
  }
}

/*******************************
 * EVENTS
 *******************************/
document.addEventListener("DOMContentLoaded", () => {

  const updateProfileBtn = document.getElementById("updateProfileBtn");
  const addActivityBtn = document.getElementById("addActivityBtn");
  const loadUsersBtn = document.getElementById("loadUsersBtn");
  const clearUsersBtn = document.getElementById("clearUsersBtn");
  const usersList = document.getElementById("usersList");
  const themeToggleBtn = document.getElementById("themeToggleBtn");

  updateProfileBtn.onclick = () => {
    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const color = document.getElementById("colorInput").value;

    if (email && !isValidEmail(email)) {
      setMessage(document.getElementById("formMessage"), "Invalid email", "error");
      return;
    }

    if (name) document.getElementById("displayName").textContent = name;
    if (email) document.getElementById("displayEmail").textContent = email;

    if (color) {
      const displayColor = document.getElementById("displayColor");
      displayColor.textContent = color;
      displayColor.style.color = color;
    }

    // 🔥 ADD TO BACKEND
    if (name && email) {
      addUser(name, email);
    }

    activityLog.add("Updated profile", "profile");
    setMessage(document.getElementById("formMessage"), "Updated ✅", "success");

    renderActivities();
  };

  addActivityBtn.onclick = () => {
    const input = document.getElementById("activityInput");

    if (!activityLog.add(input.value)) return;

    input.value = "";
    renderActivities();
  };

  loadUsersBtn.onclick = fetchUsers;

  clearUsersBtn.onclick = () => {
    document.getElementById("usersList").innerHTML = "";
    setMessage(document.getElementById("apiMessage"), "Cleared", "info");
  };

  usersList.addEventListener("click", (e) => {

    if (e.target.classList.contains("details-btn")) {
      const id = e.target.dataset.id;
      document.getElementById(`details-${id}`).classList.toggle("hidden");
    }

    if (e.target.classList.contains("fav-btn")) {
      const id = Number(e.target.dataset.id);

      if (favoriteUsers.has(id)) {
        favoriteUsers.delete(id);
        e.target.textContent = "☆ Favorite";
      } else {
        favoriteUsers.add(id);
        e.target.textContent = "★ Favorited";
      }
    }
  });

  themeToggleBtn.onclick = () => {
    document.body.classList.toggle("light-mode");
  };

  renderActivities();
});