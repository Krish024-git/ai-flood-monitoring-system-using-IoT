const POLL_MS = 5000;
const MAX_POINTS = 20;

const state = {
  latest: null,
  history: [],
  connected: false,
  chartsReady: false,
  waterChart: null,
  flowChart: null,
  alertChart: null,
  latestId: "",
  toastTimer: null
};

const $ = (selector) => document.querySelector(selector);

function fmtTime(value) {
  if (!value) return "Waiting";
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
}

function normalize(reading, index = 0) {
  if (!reading) return null;
  const status = reading.flood_status || "Normal";
  const alertActive = Boolean(reading.alert_active) || /flood|alert|danger/i.test(status);
  return {
    id: `${reading.created_at || Date.now()}-${index}`,
    sensorId: reading.sensor_id || "esp8266-node-01",
    location: reading.location_name || "River Field Node",
    latitude: Number(reading.latitude || 0),
    longitude: Number(reading.longitude || 0),
    water: Number(reading.water_level_cm || 0),
    flow: Number(reading.flow_rate_lpm || 0),
    status,
    sms: reading.sms_status || "Standby",
    message: reading.alert_message || "Telemetry synchronized",
    alertActive,
    createdAt: reading.created_at || new Date().toISOString(),
    label: fmtTime(reading.created_at)
  };
}

function chip(text, danger = false) {
  return `<span class="rounded-full px-3 py-1 text-xs font-bold ${danger ? "bg-rose-300 text-rose-950" : "bg-emerald-300 text-emerald-950"}">${text}</span>`;
}

function renderShell() {
  const navItems = [
    ["Overview", "#overview"],
    ["Live telemetry", "#telemetry"],
    ["Alerts", "#alerts"],
    ["Devices", "#devices"],
    ["Logs", "#logs"]
  ];
  $("#root").innerHTML = `
    <div id="dashboardShell" class="dashboard-shell min-h-screen">
      <aside class="desktop-sidebar fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-700/40 bg-slate-950/50 px-5 py-6 backdrop-blur-2xl">
        <div class="flex items-center gap-3">
          <div class="grid h-12 w-12 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300 shadow-neon text-xs font-black">FS</div>
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/70">FloodSentinel</p>
            <h1 class="text-xl font-extrabold text-white">AI Command</h1>
          </div>
        </div>
        <nav class="mt-10 space-y-2">
          ${navItems.map(([item, href], index) => `
            <a href="${href}" data-nav-link class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${index === 0 ? "nav-link-active" : "text-slate-400 hover:bg-white/5 hover:text-white"}">
              <span class="h-2 w-2 rounded-full ${index === 0 ? "bg-cyan-300" : "bg-slate-600"}"></span>${item}
            </a>
          `).join("")}
        </nav>
        <div class="glass-card mt-10 rounded-2xl p-4">
          <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Hardware Stack</p>
          <div class="mt-4 grid gap-3 text-sm text-slate-300">
            ${["NodeMCU ESP8266", "HC-SR04 Ultrasonic", "YF-S201 Flow Sensor", "SIM800L GSM", "LCD + Buzzer"].map((item) => `
              <div class="flex items-center gap-2"><span class="status-dot"></span>${item}</div>
            `).join("")}
          </div>
        </div>
      </aside>

      <div class="lg:pl-72">
        <header class="sticky top-0 z-20 border-b border-slate-700/30 bg-slate-950/30 backdrop-blur-2xl">
          <div class="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
            <div class="min-w-0">
              <p class="text-xs font-bold uppercase tracking-[0.26em] text-cyan-200/70">Smart-city flood operations</p>
              <h2 class="truncate text-xl font-extrabold text-white md:text-2xl">Real-time IoT Flood Monitoring Dashboard</h2>
            </div>
            <div class="flex items-center gap-2 md:gap-3">
              <a href="/" class="hidden rounded-xl border border-slate-700/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-100 sm:inline-flex">Home</a>
              <a href="/admin" class="hidden rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-100 sm:inline-flex">Admin</a>
              <div class="rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-xs text-slate-300"><span id="topDot" class="status-dot mr-2"></span><span id="topStatus">Connecting</span></div>
              <div class="hidden rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-2 font-mono text-xs text-cyan-100 md:block" id="dashboardClock">--</div>
            </div>
          </div>
        </header>

        <main class="mx-auto max-w-[1600px] space-y-5 px-4 py-5 lg:px-8 lg:py-7">
          <section id="alerts"><div id="alertBanner"></div></section>

          <section id="overview" class="glass-card relative overflow-hidden rounded-3xl p-6 lg:p-7">
            <div class="scan-line"></div>
            <div class="relative z-10 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <div>
                <div class="flex flex-wrap items-center gap-3">
                  <span id="heroDot" class="status-dot"></span>
                  <span id="heroStatus" class="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">Live telemetry lock</span>
                  <span id="sensorId" class="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs font-semibold text-slate-300">esp8266-node-01</span>
                </div>
                <h2 id="heroTitle" class="mt-5 max-w-4xl text-3xl font-extrabold leading-tight text-white md:text-5xl">Industrial AI flood intelligence, live from your river node.</h2>
                <p class="mt-4 max-w-2xl text-base leading-7 text-slate-300">NodeMCU sensor readings stream into a FastAPI control plane with five-second polling, live trend analysis, GSM status, and command-center alerts.</p>
                <div class="mt-6 flex flex-wrap gap-3">
                  <div class="rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-3"><p class="text-xs text-slate-400">Location</p><p id="location" class="mt-1 font-bold text-white">Sensor field station</p></div>
                  <div class="rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-3"><p class="text-xs text-slate-400">Last update</p><p id="lastUpdate" class="mt-1 font-mono font-bold text-cyan-100">Waiting</p></div>
                </div>
              </div>
              <div class="mini-map relative min-h-[260px] overflow-hidden rounded-2xl border border-cyan-300/15">
                <div class="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/40 bg-cyan-300/10 shadow-neon"></div>
                <div id="mapBeacon" class="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300"></div>
                <div class="absolute bottom-4 left-4 right-4 rounded-xl border border-slate-700/60 bg-slate-950/70 p-3 backdrop-blur">
                  <div id="coordinates" class="flex items-center gap-2 text-sm font-semibold text-slate-200">GPS standby</div>
                  <p class="mt-1 text-xs text-slate-400">Live river node geofence</p>
                </div>
              </div>
            </div>
          </section>

          <section id="telemetry" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div class="glass-card metric-glow rounded-2xl p-5"><p class="text-sm font-semibold text-slate-400">Water Level</p><strong id="waterMetric" class="mt-3 block font-mono text-4xl font-bold text-white">0.0 cm</strong><p class="mt-3 text-xs font-medium text-slate-400">HC-SR04 river clearance</p></div>
            <div class="glass-card metric-glow rounded-2xl p-5"><p class="text-sm font-semibold text-slate-400">Flow Rate</p><strong id="flowMetric" class="mt-3 block font-mono text-4xl font-bold text-white">0.0 L/min</strong><p class="mt-3 text-xs font-medium text-slate-400">YF-S201 hydraulic velocity</p></div>
            <div id="statusCard" class="glass-card metric-glow rounded-2xl p-5"><p class="text-sm font-semibold text-slate-400">Flood Status</p><strong id="floodMetric" class="mt-3 block text-3xl font-extrabold text-white">Normal</strong><p class="mt-3 text-xs font-medium text-slate-400">Threshold intelligence</p></div>
            <div class="glass-card metric-glow rounded-2xl p-5"><p class="text-sm font-semibold text-slate-400">SMS Alert Status</p><strong id="smsMetric" class="mt-3 block text-3xl font-extrabold text-white">Standby</strong><p class="mt-3 text-xs font-medium text-slate-400">SIM800L network escalation</p></div>
          </section>

          <section class="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <div class="glass-card rounded-2xl p-5"><p class="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/70">Live analytics</p><h3 class="mt-1 text-xl font-extrabold text-white">Water level and flow trend</h3><div class="mt-5 h-80"><canvas id="waterChart"></canvas></div></div>
            <div class="glass-card rounded-2xl p-5"><p class="text-xs font-bold uppercase tracking-[0.22em] text-rose-200/70">Alert frequency</p><h3 class="mt-1 text-xl font-extrabold text-white">Recent detections</h3><div class="mt-5 h-80"><canvas id="alertChart"></canvas></div></div>
          </section>

          <section id="devices" class="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <div class="glass-card rounded-2xl p-5"><p class="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/70">Device fabric</p><h3 class="mt-1 text-xl font-extrabold text-white">Hardware status</h3><div id="devicePanel" class="mt-5 space-y-3"></div></div>
            <div class="glass-card rounded-2xl p-5"><p class="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/70">Activity feed</p><h3 class="mt-1 text-xl font-extrabold text-white">Sensor timeline</h3><div id="activityFeed" class="mt-5 space-y-3"></div></div>
          </section>

          <section id="logs" class="glass-card rounded-2xl p-5">
            <p class="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/70">Telemetry archive</p>
            <h3 class="mt-1 text-xl font-extrabold text-white">Last 20 readings</h3>
            <div class="mt-5 overflow-x-auto">
              <table class="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
                <thead class="text-xs uppercase tracking-[0.18em] text-slate-500"><tr><th class="px-3 py-2">Time</th><th class="px-3 py-2">Water</th><th class="px-3 py-2">Flow</th><th class="px-3 py-2">Flood status</th><th class="px-3 py-2">SMS</th><th class="px-3 py-2">Node</th></tr></thead>
                <tbody id="historyBody"></tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
      <div id="dashboardToast" class="dashboard-toast glass-card rounded-2xl border border-cyan-300/20 p-4 text-sm text-slate-200"></div>
    </div>
  `;
  bindDashboardNavigation();
}

function renderMetric(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function bindDashboardNavigation() {
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelectorAll("[data-nav-link]").forEach((item) => item.classList.remove("nav-link-active"));
      link.classList.add("nav-link-active");
      document.querySelector(link.getAttribute("href"))?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function updateDashboardClock() {
  const clock = $("#dashboardClock");
  if (!clock) return;
  clock.textContent = new Date().toLocaleString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

function showToast(title, detail, danger = false) {
  const toast = $("#dashboardToast");
  if (!toast) return;
  toast.innerHTML = `
    <p class="text-xs font-black uppercase tracking-[0.22em] ${danger ? "text-rose-200" : "text-cyan-200"}">${title}</p>
    <p class="mt-1 font-semibold text-white">${detail}</p>
  `;
  toast.classList.add("show");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function renderDashboard() {
  const latest = state.latest;
  const alert = Boolean(latest?.alertActive);
  $("#dashboardShell").classList.toggle("alert-mode", alert);
  $("#overview").classList.toggle("danger-glow", alert);
  $("#statusCard").classList.toggle("danger-glow", alert);
  $("#topDot").classList.toggle("danger", !state.connected || alert);
  $("#heroDot").classList.toggle("danger", alert);
  $("#mapBeacon").className = `absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full ${alert ? "bg-rose-300" : "bg-cyan-300"}`;
  $("#topStatus").textContent = state.connected ? `Live ${fmtTime(new Date())}` : "Offline";

  if (!latest) {
    $("#activityFeed").innerHTML = `<p class="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">Waiting for first sensor transmission...</p>`;
    $("#historyBody").innerHTML = `<tr><td colspan="6" class="rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center text-slate-400">Waiting for live readings from /sensor-data</td></tr>`;
    renderDevices();
    return;
  }

  $("#alertBanner").innerHTML = alert ? `
    <div class="relative overflow-hidden rounded-2xl border border-rose-300/30 bg-rose-950/50 p-4 shadow-danger">
      <div class="siren-strip absolute inset-x-0 top-0 h-1"></div>
      <div class="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><p class="text-xs font-bold uppercase tracking-[0.24em] text-rose-100/80">Emergency Flood Alert</p><h3 class="text-lg font-extrabold text-white">${latest.message}</h3></div>
        <div class="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.16em]"><span class="rounded-full bg-rose-300 px-3 py-2 text-rose-950">Buzzer Active</span><span class="rounded-full bg-amber-300 px-3 py-2 text-amber-950">SMS Escalation</span><span class="rounded-full bg-white px-3 py-2 text-slate-950">Evacuate Low Zone</span></div>
      </div>
    </div>` : "";

  $("#heroTitle").textContent = alert ? "Flood risk escalating. Response systems are active." : "Industrial AI flood intelligence, live from your river node.";
  $("#heroStatus").textContent = state.connected ? "Live telemetry lock" : "Awaiting sensor signal";
  $("#sensorId").textContent = latest.sensorId;
  $("#location").textContent = latest.location;
  $("#lastUpdate").textContent = fmtTime(latest.createdAt);
  $("#coordinates").textContent = `${latest.latitude.toFixed(4)}, ${latest.longitude.toFixed(4)}`;
  renderMetric("#waterMetric", `${latest.water.toFixed(1)} cm`);
  renderMetric("#flowMetric", `${latest.flow.toFixed(1)} L/min`);
  renderMetric("#floodMetric", latest.status);
  renderMetric("#smsMetric", latest.sms);
  renderDevices();
  renderFeed();
  renderTable();
  updateCharts();
}

function renderDevices() {
  const latest = state.latest;
  const alert = Boolean(latest?.alertActive);
  const devices = [
    ["NodeMCU ESP8266", state.connected ? "Online" : "Offline", state.connected],
    ["HC-SR04 Ultrasonic", latest ? "Streaming" : "Standby", Boolean(latest)],
    ["YF-S201 Flow Sensor", latest ? "Streaming" : "Standby", Boolean(latest)],
    ["SIM800L GSM", latest?.sms || "Standby", !alert || /sent|ok|standby/i.test(latest?.sms || "")],
    ["LCD + Buzzer", alert ? "Active" : "Armed", true]
  ];
  $("#devicePanel").innerHTML = devices.map(([name, status, ok]) => `
    <div class="flex items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-950/30 p-3">
      <div><p class="text-sm font-bold text-white">${name}</p><p class="text-xs text-slate-400">${status}</p></div>
      <span class="status-dot ${ok ? "" : "danger"}"></span>
    </div>
  `).join("");
}

function renderFeed() {
  const rows = state.history.slice(-8).reverse();
  $("#activityFeed").innerHTML = rows.map((item) => `
    <div class="rounded-xl border border-slate-700/50 bg-slate-950/30 p-3">
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-bold text-white">${item.alertActive ? "Flood threshold event" : "Telemetry sample received"}</p>
        ${chip(item.status, item.alertActive)}
      </div>
      <p class="mt-2 text-xs leading-5 text-slate-400">${item.label} | Water ${item.water.toFixed(1)} cm | Flow ${item.flow.toFixed(1)} L/min | SMS ${item.sms}</p>
    </div>
  `).join("");
}

function renderTable() {
  $("#historyBody").innerHTML = state.history.slice(-20).reverse().map((item) => `
    <tr class="bg-slate-950/30 text-slate-200">
      <td class="rounded-l-xl px-3 py-3 font-mono text-xs text-cyan-100">${item.label}</td>
      <td class="px-3 py-3 font-bold">${item.water.toFixed(1)} cm</td>
      <td class="px-3 py-3 font-bold">${item.flow.toFixed(1)} L/min</td>
      <td class="px-3 py-3">${chip(item.status, item.alertActive)}</td>
      <td class="px-3 py-3 text-slate-300">${item.sms}</td>
      <td class="rounded-r-xl px-3 py-3 text-slate-400">${item.sensorId}</td>
    </tr>
  `).join("");
}

function initCharts() {
  if (!window.Chart || state.chartsReady) return;
  Chart.defaults.color = "#94a3b8";
  Chart.defaults.font.family = "Inter, sans-serif";
  const grid = { color: "rgba(148, 163, 184, 0.12)" };
  state.waterChart = new Chart($("#waterChart"), {
    type: "line",
    data: { labels: [], datasets: [
      { label: "Water level cm", data: [], borderColor: "#22d3ee", backgroundColor: "rgba(34, 211, 238, 0.14)", tension: 0.42, fill: true, pointRadius: 2 },
      { label: "Flow rate L/min", data: [], borderColor: "#34d399", backgroundColor: "rgba(52, 211, 153, 0.10)", tension: 0.42, fill: true, pointRadius: 2 }
    ] },
    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 500 }, plugins: { legend: { labels: { boxWidth: 10 } } }, scales: { x: { grid }, y: { grid, beginAtZero: true } } }
  });
  state.alertChart = new Chart($("#alertChart"), {
    type: "bar",
    data: { labels: [], datasets: [{ label: "Alerts", data: [], backgroundColor: [] }] },
    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 500 }, scales: { x: { grid }, y: { grid, beginAtZero: true, ticks: { precision: 0 } } } }
  });
  state.chartsReady = true;
}

function updateCharts() {
  initCharts();
  if (!state.chartsReady) return;
  const rows = state.history.slice(-MAX_POINTS);
  state.waterChart.data.labels = rows.map((item) => item.label);
  state.waterChart.data.datasets[0].data = rows.map((item) => item.water);
  state.waterChart.data.datasets[1].data = rows.map((item) => item.flow);
  state.waterChart.update("none");
  state.alertChart.data.labels = rows.slice(-10).map((item) => item.label);
  state.alertChart.data.datasets[0].data = rows.slice(-10).map((item) => item.alertActive ? 1 : 0);
  state.alertChart.data.datasets[0].backgroundColor = rows.slice(-10).map((item) => item.alertActive ? "#fb7185" : "rgba(34, 211, 238, 0.35)");
  state.alertChart.update("none");
}

async function loadSensorData() {
  try {
    const response = await fetch("/sensor-data");
    if (!response.ok) throw new Error(`Sensor API returned ${response.status}`);

    const data = await response.json();
    state.connected = true;
    state.latest = normalize({
      ...data,
      flood_status: data.status,
      sensor_id: data.sensor_id || "esp8266-node-01",
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0,
      sms_status: data.sms_status || "Standby",
      alert_message: data.alert_message || "Telemetry synchronized",
    });

    if (state.latest) {
      state.history = [...state.history, state.latest].slice(-MAX_POINTS);
    }

    renderDashboard();
    renderFeed();
    renderTable();
    updateCharts();
  } catch (error) {
    console.log(error);
    state.connected = false;
    if (state.latest) {
      renderDashboard();
    }
  }
}

renderShell();
updateDashboardClock();
setInterval(updateDashboardClock, 1000);
loadSensorData();
setInterval(loadSensorData, 2000);