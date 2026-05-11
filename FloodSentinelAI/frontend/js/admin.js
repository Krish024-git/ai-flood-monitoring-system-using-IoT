const api = {
  login: "/api/admin/login",
  visitors: "/api/admin/visitors",
  accesses: "/api/admin/accesses",
};

const $ = (id) => document.getElementById(id);

function startClock() {
  const clock = $("liveClock");
  if (!clock) return;
  const tick = () => {
    clock.textContent = new Date().toLocaleString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };
  tick();
  setInterval(tick, 1000);
}

function timeLabel(value) {
  return new Date(value).toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function credentials() {
  return {
    user: sessionStorage.getItem("flood_admin_user") || "",
    password: sessionStorage.getItem("flood_admin_password") || "",
  };
}

function adminHeaders() {
  const auth = credentials();
  return {
    "X-Admin-User": auth.user,
    "X-Admin-Password": auth.password,
  };
}

async function adminFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...adminHeaders(),
    },
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.detail || "Admin request failed");
  }
  return payload;
}

function showDashboard() {
  $("adminLogin").classList.add("hidden");
  $("adminDashboard").classList.remove("hidden");
}

function showLogin(message = "") {
  $("adminDashboard").classList.add("hidden");
  $("adminLogin").classList.remove("hidden");
  $("adminMessage").textContent = message;
  $("adminMessage").classList.toggle("error", Boolean(message));
}

async function loadAdmin() {
  const [visitors, accesses] = await Promise.all([
    adminFetch(api.visitors),
    adminFetch(api.accesses),
  ]);

  $("visitorsBody").innerHTML = visitors.visitors
    .map(
      (visitor) => `
        <tr>
          <td>${visitor.email}</td>
          <td>${visitor.phone}</td>
          <td>${timeLabel(visitor.created_at)}</td>
        </tr>
      `,
    )
    .join("");

  $("accessBody").innerHTML = accesses.accesses
    .map(
      (row) => `
        <tr>
          <td>${row.email}</td>
          <td>${row.phone}</td>
          <td>${row.state}</td>
          <td>${row.city}</td>
          <td>${row.risk_status}</td>
          <td>${timeLabel(row.created_at)}</td>
        </tr>
      `,
    )
    .join("");
}

async function login(user, password) {
  sessionStorage.setItem("flood_admin_user", user);
  sessionStorage.setItem("flood_admin_password", password);
  await adminFetch(api.login, { method: "POST" });
  showDashboard();
  await loadAdmin();
}

function bindEvents() {
  $("adminLoginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await login($("adminUser").value, $("adminPassword").value);
    } catch (error) {
      sessionStorage.removeItem("flood_admin_user");
      sessionStorage.removeItem("flood_admin_password");
      $("adminMessage").textContent = error.message;
      $("adminMessage").classList.add("error");
    }
  });

  $("refreshAdminBtn").addEventListener("click", () => {
    loadAdmin().catch((error) => showLogin(error.message));
  });

  $("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("flood_admin_user");
    sessionStorage.removeItem("flood_admin_password");
    showLogin("Logged out.");
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  startClock();
  bindEvents();
  if (credentials().user && credentials().password) {
    try {
      showDashboard();
      await loadAdmin();
    } catch (error) {
      showLogin("");
    }
  }
});
