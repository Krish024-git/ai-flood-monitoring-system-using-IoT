const api = {
  visitors: "/api/visitors",
  locations: "/api/locations/india",
  areaReport: "/api/reports/area",
  liveReport: "/api/reports/live-location",
  satellite: "/api/satellite/analyze",
  predictions: "/api/predictions",
  clearSatellitePredictions: "/api/predictions/satellite",
};

const state = {
  visitorId: null,
  locations: {},
  lastReport: { latitude: 28.6139, longitude: 77.2090, location: "New Delhi" },
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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function unlockApp() {
  document.querySelectorAll(".locked").forEach((section) => section.classList.remove("locked"));
}

function showMessage(message, isError = false) {
  $("visitorMessage").textContent = message;
  $("visitorMessage").classList.toggle("error", isError);
}

function setButtonLoading(button, isLoading, label) {
  if (!button) return;
  if (!button.dataset.label) {
    button.dataset.label = button.textContent;
  }
  button.disabled = isLoading;
  button.textContent = isLoading ? label : button.dataset.label;
}

async function loadLocations() {
  const response = await fetch(api.locations);
  if (!response.ok) {
    throw new Error("Location catalog could not be loaded.");
  }
  const payload = await response.json();
  state.locations = payload.states;
  const states = Object.keys(state.locations);
  $("stateSelect").innerHTML = states.map((stateName) => `<option>${stateName}</option>`).join("");
  updateCityOptions();
}

function updateCityOptions() {
  const selectedState = $("stateSelect").value;
  const cities = Object.keys(state.locations[selectedState] || {});
  $("citySelect").innerHTML = cities.map((city) => `<option>${city}</option>`).join("");
}

function updateReport(report) {
  state.lastReport = {
    latitude: report.latitude,
    longitude: report.longitude,
    location: `${report.city}, ${report.state}`,
  };
  $("riskStatus").textContent = report.status;
  $("riverName").textContent = report.river;
  $("waterLevel").textContent = `${report.water_level_m.toFixed(2)} m`;
  $("flowSpeed").textContent = `${report.flow_speed_mps.toFixed(2)} m/s`;
  $("windSpeed").textContent = `${report.wind_speed_kmph.toFixed(1)} km/h`;
  $("waterQuality").textContent = report.water_quality;
  $("reportLocation").textContent = `${report.city}, ${report.state}`;
  $("riskScore").textContent = report.risk_score;
  $("riskExplanation").textContent = report.risk_explanation;
  $("safeDuration").textContent = report.safe_duration;
  $("dataNote").textContent = report.data_note;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.detail || "Request failed");
  }
  return payload;
}

async function loadAreaReport() {
  if (!state.visitorId) {
    throw new Error("Please submit contact details first.");
  }
  const report = await postJson(api.areaReport, {
    visitor_id: state.visitorId,
    state: $("stateSelect").value,
    city: $("citySelect").value,
  });
  updateReport(report);
}

async function loadLiveReport() {
  if (!state.visitorId) {
    throw new Error("Please submit contact details first.");
  }
  if (!navigator.geolocation) {
    throw new Error("Browser live location is not available.");
  }
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const report = await postJson(api.liveReport, {
          visitor_id: state.visitorId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        updateReport(report);
      } catch (error) {
        alert(error.message);
      }
    },
    () => alert("Location permission was not granted."),
  );
}

async function loadSatelliteTimeline() {
  const response = await fetch(api.predictions);
  if (!response.ok) {
    throw new Error("Satellite prediction timeline could not be loaded.");
  }
  const rows = await response.json();
  const satelliteRows = rows.filter((row) => row.source === "Satellite ML");
  $("imageTimeline").innerHTML = satelliteRows.length
    ? satelliteRows
        .map(
          (row, index) => `
            <li class="timeline-card">
              <div class="timeline-step">${String(index + 1).padStart(2, "0")}</div>
              <div class="timeline-content">
                <div class="timeline-head">
                  <div>
                    <strong>Satellite image analysis</strong>
                    <span>${timeLabel(row.created_at)}</span>
                  </div>
                  <em>${row.severity}</em>
                </div>
                <div class="timeline-metrics">
                  <span>Risk <b>${Number(row.risk_score).toFixed(1)}</b></span>
                  <span>Water <b>${Number(row.water_level_m).toFixed(2)} m</b></span>
                  <span>Affected <b>${Number(row.affected_area_sq_km).toFixed(2)} sq km</b></span>
                  <span>Worse <b>${row.worse_than_previous}</b></span>
                </div>
                <p>${row.interpretation}</p>
              </div>
            </li>
          `,
        )
        .join("")
    : `<li class="timeline-empty">No satellite predictions saved yet. Upload an image and click Analyze Image.</li>`;
}

function bindEvents() {
  $("openDashboardBtn")?.addEventListener("click", () => {
    window.location.assign("/dashboard");
  });

  $("generateReportBtn")?.addEventListener("click", () => {
    document.getElementById("reports").scrollIntoView({ behavior: "smooth", block: "start" });
    if (!state.visitorId) {
      showMessage("Enter your contact details to unlock report generation.");
      $("emailInput").focus();
    }
  });

  $("visitorForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const visitor = await postJson(api.visitors, {
        email: $("emailInput").value,
        phone: $("phoneInput").value,
      });
      state.visitorId = visitor.id;
      unlockApp();
      showMessage("Welcome. Report tools are unlocked.");
      document.getElementById("reports").scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  $("stateSelect").addEventListener("change", updateCityOptions);
  $("areaReportBtn").addEventListener("click", async () => {
    const button = $("areaReportBtn");
    try {
      setButtonLoading(button, true, "Generating...");
      await loadAreaReport();
      showMessage("River report generated with live weather intelligence.");
    } catch (error) {
      showMessage(error.message, true);
      alert(error.message);
    } finally {
      setButtonLoading(button, false);
    }
  });
  $("liveReportBtn").addEventListener("click", () => loadLiveReport().catch((error) => {
    showMessage(error.message, true);
    alert(error.message);
  }));

  document.querySelectorAll("#locationTabs button").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("#locationTabs button").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      const live = tab.dataset.mode === "live";
      $("selectMode").classList.toggle("hidden", live);
      $("liveMode").classList.toggle("hidden", !live);
    });
  });

  $("satelliteForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = $("imageInput").files[0];
    if (!file) return;
    const button = event.currentTarget.querySelector("button");

    const form = new FormData();
    form.append("image", file);
    form.append("latitude", state.lastReport.latitude);
    form.append("longitude", state.lastReport.longitude);
    form.append("location_name", state.lastReport.location);

    try {
      setButtonLoading(button, true, "Analyzing...");
      const response = await fetch(api.satellite, { method: "POST", body: form });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.detail || "Image analysis failed. Try a different image.");
      }
      showMessage("Satellite ML image analysis completed.");
      await loadSatelliteTimeline();
    } catch (error) {
      showMessage(error.message, true);
      alert(error.message);
    } finally {
      setButtonLoading(button, false);
    }
  });

  $("clearTimelineBtn").addEventListener("click", async () => {
    if (!confirm("Clear all previous Satellite ML prediction data?")) return;
    const button = $("clearTimelineBtn");
    try {
      setButtonLoading(button, true, "Clearing...");
      const response = await fetch(api.clearSatellitePredictions, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.detail || "Could not clear satellite timeline.");
      }
      showMessage(`Satellite timeline cleared (${payload.deleted || 0} records removed).`);
      await loadSatelliteTimeline();
    } catch (error) {
      showMessage(error.message, true);
      alert(error.message);
    } finally {
      setButtonLoading(button, false);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  startClock();
  bindEvents();
  try {
    await loadLocations();
    await loadSatelliteTimeline();
  } catch (error) {
    showMessage(error.message, true);
  }
});
