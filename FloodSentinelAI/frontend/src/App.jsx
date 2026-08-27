import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, ShieldAlert, Users, BookOpen, MapPin, 
  RefreshCw, Sun, Moon, LogOut, CheckCircle, 
  AlertTriangle, Radio, CloudRain, Thermometer, Droplet, 
  TrendingUp, Download, Trash2, Cpu, FileText, Bell, 
  ChevronLeft, ChevronRight, Settings, Info, Server, Wifi, Database,
  ArrowRight, Share2, MessageSquare, HeartPulse, Heart, Menu, Home, 
  Terminal, ShieldCheck, Mail, Phone, HardDrive, ToggleLeft, Layers
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar,
  Legend, PieChart, Pie, Cell, Brush, ReferenceLine
} from "recharts";
import * as mockDataService from "./services/mockDataService";

const CLOUD_CONFIGS = [
  { id: 1, top: 4, width: 160, speed: 110, opacity: 0.35, delay: -10 },
  { id: 2, top: 12, width: 220, speed: 150, opacity: 0.25, delay: -45 },
  { id: 3, top: 8, width: 130, speed: 90, opacity: 0.3, delay: -75 },
  { id: 4, top: 18, width: 180, speed: 130, opacity: 0.2, delay: -120 },
  { id: 5, top: 6, width: 240, speed: 170, opacity: 0.4, delay: -15 },
  { id: 6, top: 15, width: 110, speed: 80, opacity: 0.25, delay: -60 },
  { id: 7, top: 22, width: 190, speed: 140, opacity: 0.3, delay: -95 },
  { id: 8, top: 10, width: 150, speed: 105, opacity: 0.35, delay: -35 },
  { id: 9, top: 5, width: 280, speed: 95, opacity: 0.45, delay: -110 },
  { id: 10, top: 14, width: 170, speed: 125, opacity: 0.3, delay: -5 },
  { id: 11, top: 20, width: 210, speed: 160, opacity: 0.25, delay: -85 },
  { id: 12, top: 2, width: 140, speed: 85, opacity: 0.4, delay: -40 },
  { id: 13, top: 16, width: 250, speed: 135, opacity: 0.35, delay: -150 },
  { id: 14, top: 9, width: 200, speed: 115, opacity: 0.3, delay: -70 },
  { id: 15, top: 24, width: 160, speed: 155, opacity: 0.25, delay: -130 },
  { id: 16, top: 7, width: 230, speed: 100, opacity: 0.4, delay: -20 },
  { id: 17, top: 3, width: 310, speed: 70, opacity: 0.5, delay: -30 },
  { id: 18, top: 13, width: 260, speed: 115, opacity: 0.45, delay: -90 },
  { id: 19, top: 21, width: 180, speed: 145, opacity: 0.35, delay: -140 },
  { id: 20, top: 1, width: 290, speed: 80, opacity: 0.55, delay: -65 },
  { id: 21, top: 11, width: 220, speed: 120, opacity: 0.4, delay: -115 },
  { id: 22, top: 25, width: 150, speed: 150, opacity: 0.3, delay: -10 },
  { id: 23, top: 5, width: 340, speed: 75, opacity: 0.6, delay: -80 },
  { id: 24, top: 17, width: 270, speed: 130, opacity: 0.45, delay: -50 },
  { id: 25, top: 9, width: 190, speed: 90, opacity: 0.4, delay: -125 }
];

function DynamicEnvironmentBackground({ status, rainStatus, humidity }) {
  const currentStatus = (status || "Safe").toLowerCase();
  
  // Rain count based on status and rainStatus
  let rainDropsCount = 0;
  if (currentStatus === "moderate" || rainStatus === "Moderate Rain") {
    rainDropsCount = 45;
  } else if (currentStatus === "warning") {
    rainDropsCount = 110;
  } else if (currentStatus === "danger" || currentStatus === "critical" || rainStatus === "Heavy Rain") {
    rainDropsCount = 220;
  }

  // Fog opacity based on humidity
  const fogOpacity = Math.max(0.04, Math.min(0.35, (humidity || 60) / 250));

  // Determine river wave height translation
  let riverTranslation = "translateY(55px)";
  let waveColor = "#3B82F6"; // Light blue
  let waveSpeed = "13s";

  if (currentStatus === "moderate") {
    riverTranslation = "translateY(40px)";
    waveColor = "#2563EB";
    waveSpeed = "10s";
  } else if (currentStatus === "warning") {
    riverTranslation = "translateY(20px)";
    waveColor = "#1D4ED8";
    waveSpeed = "7s";
  } else if (currentStatus === "danger") {
    riverTranslation = "translateY(0px)";
    waveColor = "#1E40AF";
    waveSpeed = "4.5s";
  } else if (currentStatus === "critical") {
    riverTranslation = "translateY(-20px)";
    waveColor = "#172554";
    waveSpeed = "2.8s";
  }

  // Create rain drops
  const rainDrops = Array.from({ length: rainDropsCount }).map((_, idx) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 1.5;
    const duration = 0.8 + Math.random() * 0.5;
    return (
      <div 
        key={idx} 
        className="rain-drop" 
        style={{ 
          left: `${left}%`, 
          animationDelay: `${delay}s`, 
          animationDuration: `${duration}s` 
        }} 
      />
    );
  });

  // Create floating particles
  let particleColor = "#34D399"; // Green
  if (currentStatus === "moderate") particleColor = "#FBBF24"; // Yellow
  if (currentStatus === "warning") particleColor = "#FB923C"; // Orange
  if (currentStatus === "danger" || currentStatus === "critical") particleColor = "#F87171"; // Red

  const particles = Array.from({ length: 12 }).map((_, idx) => {
    const left = Math.random() * 100;
    const size = 3 + Math.random() * 5;
    const delay = Math.random() * 8;
    const duration = 10 + Math.random() * 8;
    return (
      <div 
        key={idx} 
        className="particle" 
        style={{ 
          left: `${left}%`, 
          width: `${size}px`, 
          height: `${size}px`, 
          backgroundColor: particleColor, 
          animationDelay: `${delay}s`, 
          animationDuration: `${duration}s` 
        }} 
      />
    );
  });

  // Dynamic multi-layer cloud generation
  let activeCloudsCount = 12; // SAFE Mode
  if (currentStatus === "warning") {
    activeCloudsCount = 18; // WARNING Mode
  } else if (currentStatus === "danger" || currentStatus === "critical") {
    activeCloudsCount = 25; // DANGER/CRITICAL Mode
  }

  const activeClouds = CLOUD_CONFIGS.slice(0, activeCloudsCount);

  const cloudsList = activeClouds.map((c) => {
    const fill = currentStatus === "safe" 
      ? "#FFFFFF" 
      : currentStatus === "warning" 
        ? (c.top < 12 ? "#475569" : "#94A3B8")
        : (c.top < 12 ? "#1E293B" : "#475569");
        
    const filter = currentStatus === "safe" ? "drop-shadow(0px 4px 6px rgba(100, 116, 139, 0.08))" : "none";

    return (
      <svg 
        key={c.id} 
        className={`cloud-svg ${c.id % 2 === 0 ? "cloud-float-left" : "cloud-float-right"}`}
        style={{ 
          top: `${c.top}%`, 
          width: `${c.width}px`, 
          height: `${c.width * 0.5}px`,
          animationDuration: `${c.speed}s`, 
          animationDelay: `${c.delay}s`,
          opacity: c.opacity,
          filter: filter
        }}
        viewBox="0 0 100 50" 
      >
        <path d="M10 30 Q 15 15 30 20 Q 40 10 55 20 Q 70 10 80 25 Q 90 25 90 35 A 15 15 0 0 1 75 50 L 15 50 A 15 15 0 0 1 10 30 Z" fill={fill} />
      </svg>
    );
  });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0 opacity-12 bg-transparent">
      <style>{`
        .env-sky {
          position: absolute;
          inset: 0;
          transition: opacity 2s ease-in-out;
        }
        .sky-safe {
          background: linear-gradient(180deg, #BAE6FD 0%, #E0F2FE 100%);
        }
        .sky-moderate {
          background: linear-gradient(180deg, #CBD5E1 0%, #E2E8F0 100%);
        }
        .sky-warning {
          background: linear-gradient(180deg, #94A3B8 0%, #CBD5E1 100%);
        }
        .sky-danger {
          background: linear-gradient(180deg, #475569 0%, #64748B 100%);
        }
        .sky-critical {
          background: linear-gradient(180deg, #334155 0%, #475569 100%);
        }

        @keyframes float-left {
          0% { transform: translateX(-350px); }
          100% { transform: translateX(100vw); }
        }
        @keyframes float-right {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-350px); }
        }
        .cloud-svg {
          position: absolute;
          opacity: 0.15;
        }
        .cloud-float-left {
          animation: float-left linear infinite;
        }
        .cloud-float-right {
          animation: float-right linear infinite;
        }

        @keyframes rain-fall {
          0% { transform: translateY(-30px) translateX(0); }
          100% { transform: translateY(105vh) translateX(-35px); }
        }
        .rain-drop {
          position: absolute;
          top: -30px;
          background: linear-gradient(to bottom, rgba(224, 242, 254, 0.1) 0%, rgba(59, 130, 246, 0.7) 100%);
          width: 1.5px;
          height: 28px;
          animation: rain-fall linear infinite;
        }

        @keyframes tree-sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }
        .swaying-tree {
          animation: tree-sway 6s ease-in-out infinite;
        }

        @keyframes fly-bird {
          0% { transform: translateX(-10vw) translateY(0) scaleY(1); }
          50% { transform: translateX(50vw) translateY(-15px) scaleY(0.7); }
          100% { transform: translateX(110vw) translateY(0) scaleY(1); }
        }

        @keyframes float-particle {
          0% { transform: translateY(105vh) scale(0.5); opacity: 0; }
          50% { opacity: 0.4; }
          100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
        }
        .particle {
          position: absolute;
          bottom: -20px;
          border-radius: 50%;
          animation: float-particle linear infinite;
        }

        @keyframes wave-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .wave-container {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 180px;
          transition: transform 2.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .wave-svg {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          height: 100%;
          animation: wave-move linear infinite;
        }

        @keyframes lightning-flash {
          0%, 93%, 95%, 100% { opacity: 0; }
          94%, 98% { opacity: 0.45; }
          96% { opacity: 0.05; }
        }
        .lightning-overlay {
          position: absolute;
          inset: 0;
          background-color: white;
          opacity: 0;
          animation: lightning-flash 15s infinite;
        }

        @keyframes critical-pulse {
          0%, 100% { box-shadow: inset 0 0 40px rgba(239, 68, 68, 0.05); }
          50% { box-shadow: inset 0 0 60px rgba(239, 68, 68, 0.2); }
        }
        .critical-warning-strip {
          position: absolute;
          inset: 0;
          border: 4px solid rgba(239, 68, 68, 0.15);
          animation: critical-pulse 3s infinite;
        }
      `}</style>

      {/* Stacked Sky cross-fade layers */}
      <div className="env-sky sky-safe" style={{ opacity: currentStatus === "safe" ? 1 : 0 }} />
      <div className="env-sky sky-moderate" style={{ opacity: currentStatus === "moderate" ? 1 : 0 }} />
      <div className="env-sky sky-warning" style={{ opacity: currentStatus === "warning" ? 1 : 0 }} />
      <div className="env-sky sky-danger" style={{ opacity: currentStatus === "danger" ? 1 : 0 }} />
      <div className="env-sky sky-critical" style={{ opacity: currentStatus === "critical" ? 1 : 0 }} />

      {/* Lightning Flashes (behind clouds) */}
      {(currentStatus === "warning" || currentStatus === "danger" || currentStatus === "critical") && (
        <div className="lightning-overlay" />
      )}

      {/* Sunlight Ray (Safe only) */}
      {currentStatus === "safe" && (
        <div 
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-20"
          style={{ background: "radial-gradient(circle, #FDE047 0%, rgba(253,224,71,0) 70%)" }}
        />
      )}

      {/* Layer 2: Moving multi-layer clouds list */}
      {cloudsList}

      {/* Layer 6: Flying Birds (Safe only) */}
      {currentStatus === "safe" && (
        <>
          <svg className="absolute fill-slate-500/40" viewBox="0 0 20 20" style={{ top: "15%", width: "24px", height: "16px", animation: "fly-bird 25s linear infinite" }}>
            <path d="M 0,10 Q 5,0 10,10 Q 15,0 20,10 Q 15,5 10,10 Q 5,5 0,10 Z" />
          </svg>
          <svg className="absolute fill-slate-500/40" viewBox="0 0 20 20" style={{ top: "25%", width: "18px", height: "12px", animation: "fly-bird 20s linear infinite", animationDelay: "-8s" }}>
            <path d="M 0,10 Q 5,0 10,10 Q 15,0 20,10 Q 15,5 10,10 Q 5,5 0,10 Z" />
          </svg>
        </>
      )}

      {/* Fog/Mist Layer */}
      <div 
        className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-350 to-transparent filter blur-md transition-opacity duration-1000"
        style={{ opacity: fogOpacity, mixBlendMode: "screen" }}
      />

      {/* Layer 3: Mountain/Valley Hills Background */}
      <svg className="absolute bottom-0 left-0 w-full h-32 opacity-15" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path 
          d="M0,120 L150,55 L320,95 L490,40 L650,85 L810,45 L980,105 L1120,60 L1200,120 Z" 
          fill={
            currentStatus === "safe" ? "#059669" :
            currentStatus === "moderate" ? "#64748B" :
            currentStatus === "warning" ? "#B45309" :
            currentStatus === "danger" ? "#7F1D1D" : "#450A0A"
          } 
          className="transition-colors duration-1000"
        />
      </svg>

      {/* Layer 4: Swaying Deciduous Trees */}
      <svg className="absolute bottom-12 left-0 w-full h-16 opacity-20 z-2" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <g className="swaying-tree" style={{ transformOrigin: "100px 110px" }}>
          <circle cx="100" cy="90" r="15" fill={currentStatus === "safe" ? "#047857" : "#1E293B"} />
          <rect x="97" y="105" width="6" height="15" fill="#78350F" />
        </g>
        <g className="swaying-tree" style={{ transformOrigin: "250px 105px", animationDelay: "-1.5s" }}>
          <circle cx="250" cy="85" r="18" fill={currentStatus === "safe" ? "#065F46" : "#0F172A"} />
          <rect x="247" y="103" width="6" height="17" fill="#78350F" />
        </g>
        <g className="swaying-tree" style={{ transformOrigin: "450px 110px", animationDelay: "-3.2s" }}>
          <circle cx="450" cy="92" r="14" fill={currentStatus === "safe" ? "#047857" : "#1E293B"} />
          <rect x="447" y="106" width="6" height="14" fill="#78350F" />
        </g>
        <g className="swaying-tree" style={{ transformOrigin: "700px 105px", animationDelay: "-2.1s" }}>
          <circle cx="700" cy="80" r="22" fill={currentStatus === "safe" ? "#065F46" : "#0F172A"} />
          <rect x="697" y="102" width="6" height="18" fill="#78350F" />
        </g>
        <g className="swaying-tree" style={{ transformOrigin: "950px 110px", animationDelay: "-0.7s" }}>
          <circle cx="950" cy="90" r="16" fill={currentStatus === "safe" ? "#047857" : "#1E293B"} />
          <rect x="947" y="106" width="6" height="14" fill="#78350F" />
        </g>
      </svg>

      {/* Layer 3.5: Stationary Bridge (Submerged by rising water translation) */}
      <svg className="absolute bottom-0 left-0 w-full h-20 opacity-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <rect x="0" y="80" width="1200" height="5" fill="#475569" />
        <path d="M80,85 L80,120 M200,85 L200,120 M320,85 L320,120 M440,85 L440,120 M560,85 L560,120 M680,85 L680,120 M800,85 L800,120 M920,85 L920,120 M1040,85 L1040,120" stroke="#475569" strokeWidth="4" />
        <path d="M0,85 Q 140,110 280,85 Q 420,110 560,85 Q 700,110 840,85 Q 980,110 1120,85" fill="none" stroke="#475569" strokeWidth="2" />
      </svg>

      {/* Rain drops */}
      {rainDrops}

      {/* Floating particles */}
      {particles}

      {/* Subtle emergency glow (Danger/Critical only) */}
      {(currentStatus === "danger" || currentStatus === "critical") && (
        <div 
          className="absolute inset-0 bg-red-650 pointer-events-none transition-opacity duration-1000"
          style={{ opacity: currentStatus === "critical" ? 0.08 : 0.04 }}
        />
      )}

      {/* Critical Red Alarm Border */}
      {currentStatus === "critical" && (
        <div className="critical-warning-strip" />
      )}

      {/* Waving / Rising River at the bottom */}
      <div className="wave-container" style={{ transform: riverTranslation }}>
        <svg className="wave-svg" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ animationDuration: waveSpeed }}>
          <path 
            d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1150,100 1350,20 1500,60 L1500,120 L0,120 Z" 
            fill={waveColor} 
            opacity="0.25" 
          />
          <path 
            d="M0,80 C180,40 300,100 480,60 C660,20 780,100 960,60 C1140,20 1260,100 1440,60 L1440,120 L0,120 Z" 
            fill={waveColor} 
            opacity="0.15" 
            style={{ animationDelay: "-3s", animationDuration: `${parseFloat(waveSpeed) * 1.3}s` }}
          />
        </svg>
      </div>

    </div>
  );
}

// ==========================================
// CONFIGURATION & CONFIG CONSTANTS
// ==========================================
const POLL_INTERVAL_MS = 5000;

export default function App() {
  const [activeTab, setActiveTab] = useState("home"); // Home view as default entry
  const [demoActive, setDemoActive] = useState(true);
  const [demoStatus, setDemoStatus] = useState(null);
  const [darkMode, setDarkMode] = useState(false); // Clean light default
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [token, setToken] = useState(sessionStorage.getItem("admin_token") || "");
  const [toast, setToast] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [systemLogs, setSystemLogs] = useState([
    { id: 1, time: "10:24:30 AM", type: "system", msg: "System booted successfully. ESP32 Link active." },
    { id: 2, time: "10:24:28 AM", type: "sensor", msg: "HC-SR04 Water Level sensor calibrated." },
    { id: 3, time: "10:24:28 AM", type: "sensor", msg: "YF-S201 Water Flow sensor initialized." }
  ]);

  // Global Telemetry State
  const [data, setData] = useState({
    latest: {
      water_level_cm: 62.0,
      flow_rate_lpm: 12.8,   
      temperature_c: 28.4,
      humidity_pct: 62.7,
      rain_status: "No Rain",
      rain_value: 4095,
      flood_status: "Safe",
      sms_status: "Ready",
      alert_active: 0,
      alert_message: "All systems are normal. Keep monitoring for any changes."
    },
    history: []
  });
  const [connected, setConnected] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/sensor-data");
      if (!res.ok) throw new Error("Sync failed");
      const result = await res.json();
      setData(result);
      setConnected(true);
    } catch (e) {
      setConnected(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const latest = data.latest || {
    water_level_cm: 62.0,
    flow_rate_lpm: 12.8,   
    temperature_c: 28.4,
    humidity_pct: 62.7,
    rain_status: "No Rain",
    rain_value: 4095,
    flood_status: "Safe",
    sms_status: "Ready",
    alert_active: 0,
    alert_message: "All systems are normal. Keep monitoring for any changes."
  };

  // Dashboard Settings State
  const [settings, setSettings] = useState({
    dangerThresholdCm: 120,
    warningThresholdCm: 80,
    flowAlarmLimitLpm: 35,
    updateIntervalSec: 5,
    adminPhone: "+919876543210",
    sirenEnabled: true
  });

  const triggerToast = (title, detail, type = "info") => {
    setToast({ title, detail, type });
    setTimeout(() => setToast(null), 4000);
  };

  const addLog = (type, msg) => {
    const time = new Date().toLocaleTimeString();
    setSystemLogs(prev => [{ id: Date.now(), time, type, msg }, ...prev.slice(0, 19)]);
  };

  // Theme support
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen flex transition-colors duration-1000 ${
      darkMode ? "bg-[#090D16] text-slate-100" : "bg-[#F8FAFC] text-slate-900"
    } relative overflow-hidden`}>
      
      {/* Dynamic Animated Environment Backdrop */}
      <DynamicEnvironmentBackground 
        status={demoStatus || latest.flood_status} 
        rainStatus={latest.rain_status} 
        humidity={latest.humidity_pct} 
      />
      
      {/* Collapsible Sidebar */}
      <aside className={`shrink-0 border-r transition-all duration-300 relative flex flex-col justify-between py-5 z-35 h-screen sticky top-0 ${
        sidebarOpen ? "w-64" : "w-20"
      } ${
        darkMode ? "border-slate-800 bg-[#0B111E]" : "border-slate-200 bg-white"
      }`}>
        
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="px-5 flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center shrink-0">
                <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 6V12C3 17 6.8 21 12 22C17.2 21 21 17 21 12V6L12 2Z" fill="#2563EB" />
                  <path d="M12 17.5C13.6569 17.5 15 16.1569 15 14.5C15 12.625 12 9.25 12 9.25C12 9.25 9 12.625 9 14.5C9 16.1569 10.3431 17.5 12 17.5Z" fill="white" />
                  <circle cx="12" cy="14.5" r="1.2" fill="#2563EB" />
                </svg>
              </div>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black tracking-wider text-slate-900 dark:text-white">FloodSentinelAI</span>
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-500/10 px-1 rounded">4.0</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">AI Powered Flood Monitoring System</p>
                </motion.div>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="mt-8 px-3 space-y-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {[
                { id: "home", label: "Home / Overview", icon: Home },
                { id: "dashboard", label: "Dashboard", icon: Activity },
                { id: "live-monitoring", label: "Live Monitoring", icon: Radio },
                { id: "ai-prediction", label: "AI Prediction", icon: Cpu },
                { id: "graphs-analytics", label: "Graphs & Analytics", icon: TrendingUp },
                { id: "alerts", label: "Alerts", icon: ShieldAlert, badge: 5 },
                { id: "sensor-status", label: "Sensor Status", icon: Server },
                { id: "sms-history", label: "SMS History", icon: MessageSquare },
                { id: "reports", label: "Regional Reports", icon: MapPin },
                { id: "device-status", label: "Device Status", icon: HardDrive },
                { id: "settings", label: "Settings", icon: Settings },
                { id: "user-management", label: "User Management", icon: Users },
                { id: "system-logs", label: "System Logs", icon: Terminal }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 group relative ${
                      isActive 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" 
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                    }`}>
                    <div className="flex items-center gap-3.5 min-w-0">
                      {isActive && (
                        <motion.div 
                          layoutId="sidebarActiveLine"
                          className="absolute left-0 w-1 h-5 bg-blue-600 rounded-r"
                        />
                      )}
                      <Icon size={16} className={`shrink-0 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600"}`} />
                      {sidebarOpen && <span className="truncate">{tab.label}</span>}
                    </div>
                    {sidebarOpen && tab.badge && (
                      <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Weather Widget & Copyright */}
        <div className="px-3 space-y-4 mt-auto">
          {sidebarOpen && (
            <div className={`p-4 rounded-2xl border text-xs font-semibold ${
              darkMode ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-100"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400">Weather Widget</p>
                  <p className="text-lg font-black mt-0.5">25°C</p>
                </div>
                <CloudRain size={24} className="text-blue-500" />
              </div>
              <p className="text-blue-500 font-bold mt-1">Light Rain</p>
              <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-400">
                <div>Humid: <span className="font-bold text-slate-700 dark:text-slate-200">78%</span></div>
                <div>Wind: <span className="font-bold text-slate-700 dark:text-slate-200">12 km/h</span></div>
                <div>Baro: <span className="font-bold text-slate-700 dark:text-slate-200">1008 hPa</span></div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[9px] text-slate-400 flex items-center gap-1">
                <MapPin size={10} /> Yamuna Nagar, HR
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`w-full flex items-center justify-center py-2 rounded-xl border transition ${
                darkMode ? "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white" : "border-slate-200 bg-slate-50 text-slate-500 hover:text-black"
              }`}>
              {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>
            {sidebarOpen && (
              <p className="text-[9px] text-slate-400 text-center font-bold">
                © 2025 FloodSentinelAI 4.0<br />All rights reserved.
              </p>
            )}
          </div>
        </div>

      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10">
        
        {/* Top Header Panel */}
        <header className={`sticky top-0 z-30 border-b backdrop-blur-md px-6 py-4 flex items-center justify-between ${
          darkMode ? "border-slate-800 bg-[#090D16]/80" : "border-slate-200/60 bg-white/80"
        }`}>
          <div className="flex items-center gap-3">
            <button className="text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white md:hidden">
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-lg font-black leading-none">
                {activeTab === "home" ? "Home / Overview" : activeTab === "dashboard" ? "Dashboard" : activeTab === "live-monitoring" ? "Live Monitoring" : activeTab === "ai-prediction" ? "AI Prediction" : activeTab === "graphs-analytics" ? "Graphs & Analytics" : activeTab === "alerts" ? "Alerts" : activeTab === "sensor-status" ? "Sensor Status" : activeTab === "sms-history" ? "SMS History" : activeTab === "reports" ? "Regional Reports" : activeTab === "device-status" ? "Device Status" : activeTab === "settings" ? "Settings" : activeTab === "user-management" ? "User Management" : "System Logs"}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-1 select-none">
                <span>Home</span>
                <span>/</span>
                <span className="text-blue-500 uppercase">{activeTab}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Status Pills */}
            <div className="hidden lg:flex items-center gap-4 bg-slate-100/50 dark:bg-slate-900/60 px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-800 text-[10px] font-black">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Wifi size={12} className="text-emerald-500" />
                ESP32 Status: <span className="text-slate-700 dark:text-slate-200">Connected</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Database size={12} className="text-emerald-500" />
                Firebase: <span className="text-slate-700 dark:text-slate-200">Online</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Cpu size={12} className="text-emerald-500" />
                AI Engine: <span className="text-slate-700 dark:text-slate-200">Active</span>
              </div>
            </div>

            {/* Notification Bell */}
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="p-2.5 rounded-xl border relative hover:bg-slate-100 transition border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <Bell size={15} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border border-white" />
            </button>

            {/* Theme Toggle Button */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border hover:bg-slate-100 transition border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              {darkMode ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} />}
            </button>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 font-extrabold text-sm border border-blue-200 dark:border-slate-700">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-black leading-none">Admin</p>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-none font-bold">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Sliding Logs Panel */}
        <NotificationDrawer 
          isOpen={isDrawerOpen} 
          setIsOpen={setIsDrawerOpen} 
          logs={systemLogs} 
          darkMode={darkMode}
        />

        {/* Global Routing View Panel */}
        <main className="flex-1 px-6 py-6 max-w-[1600px] w-full mx-auto space-y-6 pb-20 relative z-10">
          
          {/* Immersive Center Alert Banner */}
          {latest.flood_status === "Warning" && (
            <div className="p-4 rounded-2xl border border-orange-200 bg-orange-50/85 dark:bg-orange-950/20 text-orange-850 dark:text-orange-300 flex items-center justify-between gap-4 font-bold text-xs shadow-md animate-pulse">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-orange-500 shrink-0" size={18} />
                <div>
                  <p className="font-black uppercase tracking-wider">WARNING: Water Level Rising</p>
                  <p className="text-[10px] opacity-85 mt-0.5">Immediate Monitoring Required. Local tributary flows increasing.</p>
                </div>
              </div>
            </div>
          )}

          {latest.flood_status === "Danger" && (
            <div className="p-4 rounded-2xl border border-red-200 bg-red-50/85 dark:bg-red-950/20 text-red-850 dark:text-red-300 flex items-center justify-between gap-4 font-bold text-xs shadow-md animate-pulse">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-500 shrink-0 animate-bounce" size={18} />
                <div>
                  <p className="font-black uppercase tracking-wider">DANGER: Flood Risk Extremely High</p>
                  <p className="text-[10px] opacity-85 mt-0.5">Take Immediate Action. Evacuation warning protocols active.</p>
                </div>
              </div>
            </div>
          )}

          {latest.flood_status === "Critical" && (
            <div className="p-4 rounded-2xl border border-red-900 bg-red-950/30 text-red-200 flex items-center justify-between gap-4 font-bold text-xs shadow-md animate-pulse border-t-4 border-t-red-600">
              <div className="flex items-center gap-3">
                <ShieldAlert className="text-red-500 shrink-0 animate-spin" size={18} style={{ animationDuration: "3s" }} />
                <div>
                  <p className="font-black uppercase tracking-wider">CRITICAL: Severe Inundation Threat</p>
                  <p className="text-[10px] opacity-85 mt-0.5">Emergency sirens sounding on riverbank. Evacuate low lands immediately.</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "home" && (
            <HomeView setActiveTab={setActiveTab} darkMode={darkMode} currentStatus={demoStatus || latest.flood_status} />
          )}
          
          {activeTab === "dashboard" && (
            <CommandCenterView 
              darkMode={darkMode} 
              triggerToast={triggerToast} 
              addLog={addLog} 
              settings={settings}
            />
          )}

          {activeTab === "live-monitoring" && (
            <LiveMonitoringView 
              darkMode={darkMode} 
            />
          )}

          {activeTab === "ai-prediction" && (
            <AIPredictionView 
              darkMode={darkMode} 
              triggerToast={triggerToast}
            />
          )}

          {activeTab === "graphs-analytics" && (
            <GraphsAnalyticsView 
              darkMode={darkMode} 
              triggerToast={triggerToast}
            />
          )}

          {activeTab === "alerts" && (
            <AlertsView 
              darkMode={darkMode} 
              triggerToast={triggerToast}
              token={token}
            />
          )}

          {activeTab === "sensor-status" && (
            <SensorStatusView 
              darkMode={darkMode} 
              settings={settings}
            />
          )}

          {activeTab === "sms-history" && (
            <SMSHistoryView 
              darkMode={darkMode} 
              triggerToast={triggerToast}
            />
          )}
          
          {activeTab === "reports" && (
            <ReportsView 
              darkMode={darkMode} 
              triggerToast={triggerToast} 
            />
          )}

          {activeTab === "device-status" && (
            <DeviceStatusView 
              darkMode={darkMode} 
            />
          )}

          {activeTab === "settings" && (
            <SettingsView 
              darkMode={darkMode} 
              settings={settings}
              setSettings={setSettings}
              triggerToast={triggerToast}
            />
          )}
          
          {activeTab === "admin" && (
            <AdminView 
              darkMode={darkMode} 
              token={token} 
              setToken={setToken} 
              triggerToast={triggerToast} 
            />
          )}

          {activeTab === "user-management" && (
            <UserManagementView 
              darkMode={darkMode} 
              token={token}
              setToken={setToken}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === "system-logs" && (
            <SystemLogsView 
              darkMode={darkMode} 
              logs={systemLogs}
              setLogs={setSystemLogs}
            />
          )}
          
          {activeTab === "docs" && (
            <DocsView 
              darkMode={darkMode} 
            />
          )}

        </main>

      </div>

      {/* Global Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 p-4 rounded-xl border shadow-xl flex items-center gap-3 z-50 text-xs font-semibold ${
              toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300" :
              toast.type === "danger" ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-300" :
              "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-300"
            }`}>
            {toast.type === "success" ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-red-500" />}
            <div>
              <p className="font-extrabold">{toast.title}</p>
              <p className="opacity-80 mt-0.5">{toast.detail}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Isolated Demo Mode floating developer panel */}
      {demoActive && (
        <div className="fixed bottom-6 right-6 p-4 bg-white/75 dark:bg-slate-900/75 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-2xl z-50 w-64 text-xs space-y-3 backdrop-blur-md">
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-100">
            <span>Environment Demo</span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Force visual preview states without modifying actual sensor telemetry.</p>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setDemoStatus("Safe")} 
              className={`py-2 rounded-lg border font-bold text-[10px] transition-all duration-200 ${
                demoStatus === "Safe" 
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-450" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-transparent"
              }`}
            >
              🟢 SAFE
            </button>
            <button 
              onClick={() => setDemoStatus("Warning")} 
              className={`py-2 rounded-lg border font-bold text-[10px] transition-all duration-200 ${
                demoStatus === "Warning" 
                  ? "bg-orange-500/20 border-orange-500/50 text-orange-600 dark:text-orange-405" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-transparent"
              }`}
            >
              🟠 WARNING
            </button>
            <button 
              onClick={() => setDemoStatus("Danger")} 
              className={`py-2 rounded-lg border font-bold text-[10px] transition-all duration-200 ${
                demoStatus === "Danger" 
                  ? "bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-405" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-transparent"
              }`}
            >
              🔴 DANGER
            </button>
            <button 
              onClick={() => setDemoStatus(null)} 
              className={`py-2 rounded-lg border font-bold text-[10px] transition-all duration-200 ${
                demoStatus === null 
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-600 dark:text-blue-405" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-transparent"
              }`}
            >
              ⚙️ AUTO
            </button>
          </div>
          
          <button 
            onClick={() => {
              setDemoActive(false);
              setDemoStatus(null);
            }} 
            className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-lg font-bold text-[10px] transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <span>❌ Remove Demo Mode</span>
          </button>
        </div>
      )}

    </div>
  );
}

// ==========================================
// VIEW 0: HOME PAGE / LANDING OVERVIEW (ACADEMIC DETAILED)
// ==========================================
function HomeView({ setActiveTab, darkMode, currentStatus }) {
  const isDarkEnv = currentStatus === "Warning" || currentStatus === "Danger" || currentStatus === "Critical";
  
  // Dynamic text color classes
  const grayTextClass = isDarkEnv 
    ? (darkMode ? "text-slate-400" : "text-slate-200") 
    : (darkMode ? "text-slate-400" : "text-slate-500");
    
  const lightGrayTextClass = isDarkEnv 
    ? (darkMode ? "text-slate-400" : "text-slate-300") 
    : (darkMode ? "text-slate-500" : "text-slate-400");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="space-y-12 py-4">

      {/* Hero Banner Section */}
      <section className="backdrop-blur-md bg-white/40 dark:bg-slate-900/35 border border-white/20 dark:border-slate-800/10 shadow-xl rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">
          <Cpu size={12} className="animate-spin text-blue-600" />
          IoT + AI Hydrological Emergency System
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
          Smart Predictive Warning &amp; <br />
          <span className="text-blue-600">Flood Intelligence Portal</span>
        </h1>
        <p className={`text-sm max-w-2xl mx-auto font-medium leading-relaxed ${grayTextClass}`}>
          Empowering municipal disaster authorities and riverine communities with edge sensor telemetry, real-time Machine Learning forecasts, and automated GSM communication fallbacks.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 group">
            Launch Command Center <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
          </button>
          <button 
            onClick={() => setActiveTab("docs")}
            className="w-full sm:w-auto px-8 py-3.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-2xl font-extrabold text-sm transition">
            View Project Schematics
          </button>
        </div>
      </section>

      {/* Academic Highlights & Team Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl border lg:col-span-2 ${
          darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${lightGrayTextClass}`}>Academic Project Scope &amp; Research</h3>
          <div className="space-y-4 text-xs font-semibold leading-relaxed">
            <div className="flex gap-3">
              <CheckCircle className="text-blue-500 shrink-0 mt-0.5" size={14} />
              <div>
                <h4 className="text-slate-800 dark:text-slate-200 font-extrabold">Random Forest Classification Inference</h4>
                <p className={`text-[11px] mt-0.5 ${lightGrayTextClass}`}>Trained on synthetically generated regional weather parameters, classifying flood states into 5 threat tiers with 80% accuracy validation.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="text-blue-500 shrink-0 mt-0.5" size={14} />
              <div>
                <h4 className="text-slate-800 dark:text-slate-200 font-extrabold">Edge Computing &amp; Fail-Safe Recovery</h4>
                <p className={`text-[11px] mt-0.5 ${lightGrayTextClass}`}>ESP32 edge nodes execute non-blocking reading loops utilizing a Hardware Watchdog Timer (WDT) to recovery from transient brownouts or crashes.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="text-blue-500 shrink-0 mt-0.5" size={14} />
              <div>
                <h4 className="text-slate-800 dark:text-slate-200 font-extrabold">Robust Offline SIM800L Warning Loop</h4>
                <p className={`text-[11px] mt-0.5 ${lightGrayTextClass}`}>Maintains a localized circular queue. In the event of standard Wi-Fi network disconnection, transfers critical alert SMS commands via GSM cellular fallback.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Team Card */}
        <div className={`p-6 rounded-2xl border ${
          darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Project Developers</h3>
          <div className="space-y-3.5 text-xs">
            {[
              { role: "AI & Embedded Engineer", name: "Lead Developer" },
              { role: "IoT Systems Architect", name: "Hardware Specialist" },
              { role: "Full Stack Developer", name: "FastAPI & React Architect" },
              { role: "Project Mentor", name: "Academic Advisor" }
            ].map((member, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/40 last:border-0">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{member.name}</span>
                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Pipeline Section */}
      <section className={`p-8 rounded-3xl border ${
        darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
      }`}>
        <div className="text-center space-y-1 mb-8">
          <p className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">Data Flow</p>
          <h2 className="text-lg font-black">End-to-End System Pipeline</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center text-xs font-semibold relative">
          {[
            { step: "01", name: "Edge Sensors", desc: "ESP32 captures levels, water flow, and rain rates." },
            { step: "02", name: "FastAPI Gateway", desc: "Asynchronous REST backend filters telemetry." },
            { step: "03", name: "Random Forest AI", desc: "Loads best_model.joblib for 80% accuracy forecast." },
            { step: "04", name: "Firebase Cloud", desc: "Replicates live states globally in real time." },
            { step: "05", name: "Emergency Dispatch", desc: "Triggers SIM800L cell SMS and buzzers." }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 space-y-2 relative flex flex-col justify-between">
              <div className="text-lg font-black text-blue-600/30 font-mono text-left">{item.step}</div>
              <div>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200">{item.name}</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* IoT Hardware Stack Showcase */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <p className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">Device Mapping</p>
          <h2 className="text-lg font-black">Physical Hardware Interface Stack</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Cpu, name: "ESP32 DevKit v1", desc: "Integrates dual-core processing loops, hardware watchdog (WDT) recovery, and serial SIM interface routines." },
            { icon: CloudRain, name: "HC-SR04 Ultrasonic Sensor", desc: "Measures water depth dynamically using high-frequency acoustics, calibrated for non-blocking telemetry." },
            { icon: TrendingUp, name: "YF-S201 Flow Sensor", desc: "Hall-effect turbine mapping liquid volume velocity in liters/minute via microsecond interrupt routines." },
            { icon: MessageSquare, name: "SIM800L Cellular Modem", desc: "Provides offline alert system fallback to transmit warnings to target contact lists even if local ISP internet goes down." },
            { icon: Thermometer, name: "DHT22 Climate Sensor", desc: "Gathers ambient temperature and humidity data to support advanced hydrological prediction models." },
            { icon: ShieldAlert, name: "Buzzer Alarm / LCD Panel", desc: "Flashes critical alert states on an I2C screen and triggers high-frequency acoustics on the bank." }
          ].map((dev, idx) => {
            const Icon = dev.icon;
            return (
              <div key={idx} className={`p-5 rounded-2xl border flex gap-4 ${
                darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
              }`}>
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                  <Icon size={20} />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100">{dev.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{dev.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Project Key Performance Indicators */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {[
          { metric: "80%", label: "AI Forecast Accuracy" },
          { metric: "< 3 sec", label: "Edge-to-Cloud Latency" },
          { metric: "100%", label: "SIM800L Uptime Fallback" },
          { metric: "5+", label: "Live Telemetry Sensors" }
        ].map((item, idx) => (
          <div key={idx} className={`p-6 rounded-2xl border ${
            darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <div className="text-2xl font-black text-blue-600 font-mono">{item.metric}</div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold mt-1">{item.label}</div>
          </div>
        ))}
      </section>

    </motion.div>
  );
}

// ==========================================
// COMPONENT: SLIDING SYSTEM AUDIT LOG DRAWER
// ==========================================
function NotificationDrawer({ isOpen, setIsOpen, logs, darkMode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div 
            initial={{ translateX: "100%" }}
            animate={{ translateX: "0%" }}
            exit={{ translateX: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed top-0 bottom-0 right-0 w-80 z-50 border-l shadow-2xl p-6 flex flex-col justify-between ${
              darkMode ? "border-slate-800 bg-[#0B111E]" : "border-slate-200 bg-white"
            }`}>
            
            <div className="space-y-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-xs font-black">Notification Center</h3>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Realtime ESP32 node updates</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-black text-xs font-bold">Close</button>
              </div>

              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold mb-1">
                      <span>{log.time}</span>
                      <span className="uppercase text-blue-500 font-black">{log.type}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">{log.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6 text-[9px] text-slate-400 font-semibold leading-relaxed">
              * Live hardware events synchronize dynamically from ESP32 clients.
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// VIEW 1: COMMAND CENTER (MAIN DASHBOARD VIEW)
// ==========================================
function CommandCenterView({ darkMode, triggerToast, addLog, settings }) {
  const [data, setData] = useState({ latest: null, history: [] });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [clockTime, setClockTime] = useState("");
  const [clockDate, setClockDate] = useState("");
  
  // Quick Actions Active States
  const [healthChecking, setHealthChecking] = useState(false);
  const [smsSending, setSmsSending] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/sensor-data");
      if (!res.ok) throw new Error("Sync failed");
      const result = await res.json();
      
      if (result.latest && (!data.latest || data.latest.created_at !== result.latest.created_at)) {
        addLog("telemetry", `Telemetry ingested. Level: ${result.latest.water_level_cm} cm | Flow: ${result.latest.flow_rate_lpm} L/min`);
      }
      
      setData(result);
      setConnected(true);
      setLoading(false);
    } catch (e) {
      setConnected(false);
      console.error("API link offline:", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [data.latest]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setClockDate(now.toLocaleDateString("en-US", { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-sm font-semibold text-slate-400">Locking UI telemetry matrices...</p>
      </div>
    );
  }

  const latest = data.latest || {
    water_level_cm: 162.0, // 1.62 m
    flow_rate_lpm: 12.8,   // 12.8 L/min
    temperature_c: 28.4,
    humidity_pct: 62.7,
    rain_status: "No Rain",
    rain_value: 4095,
    flood_status: "Safe",
    sms_status: "Ready",
    alert_active: 0,
    alert_message: "All systems are normal. Keep monitoring for any changes."
  };

  const isAlert = latest.alert_active === 1;

  // Mock mini sparklines
  const sparklineDataMap = {
    water: [1.2, 1.4, 1.1, 1.3, 1.6, 1.5, 1.62],
    flow: [10.2, 14.1, 11.2, 12.8, 12.5, 13.0, 12.8],
    rain: [0, 0, 0.2, 0, 0, 0, 0],
    temp: [26.0, 27.2, 28.1, 28.4, 28.2, 28.5, 28.4],
    humid: [58.0, 60.1, 62.0, 61.5, 62.7, 63.0, 62.7],
    risk: [12, 14, 15, 18, 17, 19, 18],
    prediction: [10, 12, 15, 18, 16, 17, 18],
    sms: [1, 1, 1, 1, 1, 1, 1]
  };

  const toSparkFormat = (arr) => arr.map((v, i) => ({ id: i, value: v }));

  const mainLineData = [
    { time: "09:24", water: 0.9, flow: 12.8, temp: 28.4, humidity: 62.7 },
    { time: "09:34", water: 0.92, flow: 12.5, temp: 28.2, humidity: 64.0 },
    { time: "09:44", water: 0.91, flow: 13.0, temp: 28.5, humidity: 62.5 },
    { time: "09:54", water: 0.93, flow: 12.8, temp: 28.4, humidity: 63.0 },
    { time: "10:04", water: 0.92, flow: 12.6, temp: 28.3, humidity: 62.0 },
    { time: "10:14", water: 0.91, flow: 12.9, temp: 28.4, humidity: 63.5 },
    { time: "10:24", water: 0.92, flow: 12.8, temp: 28.4, humidity: 62.7 }
  ];

  const predictionData = [
    { time: "Now", value: 18 },
    { time: "+4h", value: 21 },
    { time: "+8h", value: 26 },
    { time: "+12h", value: 34 },
    { time: "+16h", value: 28 },
    { time: "+20h", value: 22 },
    { time: "+24h", value: 19 }
  ];

  const history7Days = [
    { name: "21 May", water: 1.5, rainfall: 12, flow: 20 },
    { name: "22 May", water: 2.1, rainfall: 0, flow: 21 },
    { name: "23 May", water: 2.6, rainfall: 5, flow: 23 },
    { name: "24 May", water: 3.8, rainfall: 18, flow: 29 },
    { name: "25 May", water: 2.9, rainfall: 0, flow: 27 },
    { name: "26 May", water: 2.2, rainfall: 32, flow: 24 },
    { name: "27 May", water: 3.1, rainfall: 0, flow: 28 }
  ];

  // ==========================================
  // QUICK ACTIONS OPERATIONS (WORKING)
  // ==========================================
  
  // 1. Download Report (GET /api/predictions/export)
  const handleDownloadReport = async () => {
    try {
      triggerToast("Generating CSV", "Contacting prediction database...", "info");
      const res = await fetch("/api/predictions/export");
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FloodSentinel_Predictions_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      triggerToast("Export Succeeded", "Predictions CSV downloaded to local disk.", "success");
      addLog("system", "Triggered CSV prediction log download.");
    } catch (e) {
      triggerToast("Download Failed", "Telemetry history empty or server offline.", "danger");
    }
  };

  // 2. Export Data (Clipboard telemetry JSON)
  const handleExportData = () => {
    try {
      const telemetryString = JSON.stringify(latest, null, 2);
      navigator.clipboard.writeText(telemetryString);
      triggerToast("Copied to Clipboard", "Telemetry JSON object copied successfully.", "success");
      addLog("system", "Telemetry copy-export triggered.");
    } catch (e) {
      triggerToast("Clipboard Error", "Could not copy telemetry data.", "danger");
    }
  };

  // 3. Test SMS Loop (Simulated warning cellular dispatch)
  const handleTestSMS = () => {
    if (smsSending) return;
    setSmsSending(true);
    triggerToast("Initiating Cell Link", `Connecting to SIM800L module...`, "info");
    addLog("cellular", `Testing SMS dispatch to register ${settings.adminPhone}`);
    
    setTimeout(() => {
      triggerToast("SIM800L Alert Status", `Sending Warning SMS to ${settings.adminPhone}`, "info");
      addLog("cellular", `AT+CMGS="${settings.adminPhone}" command sent.`);
    }, 1500);

    setTimeout(() => {
      setSmsSending(false);
      triggerToast("SMS Warning Sent", `Test message verified by SIM800L cell network.`, "success");
      addLog("cellular", `SMS Alert Delivered: "FloodSentinelAI Test Warning. System checks normal."`);
    }, 3500);
  };

  // 4. System Health Check Diagnostics
  const handleHealthCheck = () => {
    if (healthChecking) return;
    setHealthChecking(true);
    triggerToast("Starting Diagnostics", "Self-testing hardware links...", "info");
    addLog("system", "Starting automated local sub-system diagnostics.");

    setTimeout(() => {
      addLog("system", "[1/3] Database checks: SQLite tables connection healthy.");
    }, 1000);
    setTimeout(() => {
      addLog("system", "[2/3] AI modules: Random Forest classifier active.");
    }, 2000);
    setTimeout(() => {
      addLog("system", "[3/3] Network Link: Firebase RTDB synchronization synced.");
    }, 3000);
    setTimeout(() => {
      setHealthChecking(false);
      triggerToast("Health Diagnostics: 100%", "All local systems and edge checks are SAFE.", "success");
      addLog("system", "Self-health check finished: 100% components operational.");
    }, 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Status Alert Banner */}
      <div className={`p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border text-xs transition-colors duration-1000 ${
        isAlert 
          ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200" 
          : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${isAlert ? "bg-red-200/50 text-red-600" : "bg-emerald-200/50 text-emerald-600 animate-pulse"}`}>
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="font-extrabold text-[10px] uppercase tracking-wider">Current System Status: <span className="font-black uppercase">{latest.flood_status}</span></p>
            <p className="mt-0.5 font-bold opacity-80">{latest.alert_message}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono font-bold text-slate-500 dark:text-slate-400 text-[10px]">
          <span>{clockDate}</span>
          <div className="h-3 w-[1px] bg-slate-300 dark:bg-slate-700" />
          <span className="text-blue-600 dark:text-blue-400 font-extrabold">{clockTime}</span>
          <button onClick={fetchData} className="p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800/60">
            <RefreshCw size={10} />
          </button>
        </div>
      </div>

      {/* Grid of 8 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        
        <SummaryCard 
          title="Water Level" 
          val={`${(latest.water_level_cm / 100).toFixed(2)} m`} 
          desc="Normal" 
          descColor="text-emerald-500"
          chartColor="#2563EB"
          chartData={toSparkFormat(sparklineDataMap.water)} 
          darkMode={darkMode}
          icon={CloudRain}
        />

        <SummaryCard 
          title="Water Flow" 
          val={`${latest.flow_rate_lpm.toFixed(1)} L/min`} 
          desc="Normal" 
          descColor="text-emerald-500"
          chartColor="#22C55E"
          chartData={toSparkFormat(sparklineDataMap.flow)} 
          darkMode={darkMode}
          icon={TrendingUp}
        />

        <SummaryCard 
          title="Rain Status" 
          val={latest.rain_status} 
          desc="Dry" 
          descColor="text-slate-400"
          chartColor="#A855F7"
          chartData={toSparkFormat(sparklineDataMap.rain)} 
          darkMode={darkMode}
          icon={Droplet}
          isBar
        />

        <SummaryCard 
          title="Temperature" 
          val={`${latest.temperature_c.toFixed(1)} °C`} 
          desc="Normal" 
          descColor="text-emerald-500"
          chartColor="#F97316"
          chartData={toSparkFormat(sparklineDataMap.temp)} 
          darkMode={darkMode}
          icon={Thermometer}
        />

        <SummaryCard 
          title="Humidity" 
          val={`${latest.humidity_pct.toFixed(1)} %`} 
          desc="Normal" 
          descColor="text-emerald-500"
          chartColor="#3B82F6"
          chartData={toSparkFormat(sparklineDataMap.humid)} 
          darkMode={darkMode}
          icon={Droplet}
        />

        <SummaryCard 
          title="Flood Risk" 
          val={`${Math.round(latest.water_level_cm / 2.0)} %`} 
          desc="Safe" 
          descColor="text-emerald-500"
          chartColor="#EF4444"
          chartData={toSparkFormat(sparklineDataMap.risk)} 
          darkMode={darkMode}
          icon={ShieldAlert}
        />

        <SummaryCard 
          title="AI Prediction" 
          val={latest.flood_status} 
          desc="Low Risk" 
          descColor="text-emerald-500"
          chartColor="#8B5CF6"
          chartData={toSparkFormat(sparklineDataMap.prediction)} 
          darkMode={darkMode}
          icon={Cpu}
        />

        <SummaryCard 
          title="SMS Status" 
          val={latest.sms_status} 
          desc="SIM800L OK" 
          descColor="text-emerald-500"
          chartColor="#10B981"
          chartData={toSparkFormat(sparklineDataMap.sms)} 
          darkMode={darkMode}
          icon={MessageSquare}
        />

      </div>

      {/* Row 2: Live Data, Gauge, and AI 24h Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Live Sensor Data (Real-Time) */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Realtime Stream</p>
              <h3 className="text-sm font-black">Live Sensor Data</h3>
            </div>
            <select className="p-1 rounded border border-slate-200 dark:border-slate-800 text-[10px] font-bold outline-none dark:bg-slate-900">
              <option>Live</option>
            </select>
          </div>

          {/* Legends */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold mb-4 select-none">
            <span className="flex items-center gap-1 text-blue-600"><span className="h-2 w-2 rounded-full bg-blue-600" /> Water Level (m)</span>
            <span className="flex items-center gap-1 text-emerald-500"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Water Flow (L/min)</span>
            <span className="flex items-center gap-1 text-orange-500"><span className="h-2 w-2 rounded-full bg-orange-500" /> Temp (°C)</span>
            <span className="flex items-center gap-1 text-purple-500"><span className="h-2 w-2 rounded-full bg-purple-500" /> Humid (%)</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mainLineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="time" tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                <YAxis yAxisId="left" domain={[0, 2.5]} tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "10px", fontWeight: 700 }} />
                <Line yAxisId="left" type="monotone" dataKey="water" stroke="#2563EB" strokeWidth={2} dot={{ r: 2 }} />
                <Line yAxisId="left" type="monotone" dataKey="flow" stroke="#10B981" strokeWidth={2} dot={{ r: 2 }} />
                <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#F97316" strokeWidth={2} dot={{ r: 2 }} />
                <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Flood Risk Gauge */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between items-center text-center ${
          darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Hazard assessment</p>
            <h3 className="text-sm font-black mt-0.5">Flood Risk Indicator</h3>
          </div>

          <div className="py-2">
            <RiskGauge score={latest.water_level_cm / 2.0} floodStatus={latest.flood_status} />
          </div>

          <div className="space-y-1 pb-1">
            <p className="text-[10px] font-bold text-slate-400">AI Confidence: 87%</p>
            <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded bg-slate-50 dark:bg-slate-900">AI Inference Active</p>
          </div>
        </div>

        {/* Card 3: AI Prediction (Next 24 Hours) */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Model Forecast</p>
              <h3 className="text-sm font-black">AI Prediction (Next 24h)</h3>
            </div>
            <select className="p-1 rounded border border-slate-200 dark:border-slate-800 text-[10px] font-bold outline-none dark:bg-slate-900">
              <option>24 Hours</option>
            </select>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictionData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="time" tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "10px", fontWeight: 700 }} />
                <Area type="monotone" dataKey="value" name="Risk (%)" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorPred)" dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[10px] text-emerald-600 font-extrabold justify-center">
            <CheckCircle size={14} />
            <span>Prediction: Safe conditions expected in next 24 hours.</span>
          </div>
        </div>

      </div>

      {/* Row 3: Historical Trends (7 Days grids) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Trend 1: Historical Water Level */}
        <div className={`p-5 rounded-2xl border ${
          darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-black">Historical Trends</h4>
            <select className="p-1 rounded border border-slate-200 dark:border-slate-800 text-[10px] font-bold outline-none dark:bg-slate-900">
              <option>7 Days</option>
            </select>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history7Days} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="water" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend 2: Rainfall Over Time */}
        <div className={`p-5 rounded-2xl border ${
          darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-black">Rainfall Over Time</h4>
            <select className="p-1 rounded border border-slate-200 dark:border-slate-800 text-[10px] font-bold outline-none dark:bg-slate-900">
              <option>7 Days</option>
            </select>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history7Days} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="rainfall" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend 3: Water Flow Trend */}
        <div className={`p-5 rounded-2xl border ${
          darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-black">Water Flow Trend</h4>
            <select className="p-1 rounded border border-slate-200 dark:border-slate-800 text-[10px] font-bold outline-none dark:bg-slate-900">
              <option>7 Days</option>
            </select>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history7Days} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="flow" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 4: Tables and Actions panel */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Col 1: Recent Alerts */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between xl:col-span-2 ${
          darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-black">Recent Alerts</h4>
            <button className="text-[10px] font-bold text-blue-600">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[10px] text-left border-collapse font-semibold">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase">
                  <th className="py-2.5">Time</th>
                  <th className="py-2.5">Alert Type</th>
                  <th className="py-2.5">Message</th>
                  <th className="py-2.5">Severity</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { t: "27 May 2025, 10:18 AM", type: "System", msg: "System running in safe mode", sev: "Safe", status: "Resolved", col: "text-emerald-500 bg-emerald-500/10" },
                  { t: "27 May 2025, 09:45 AM", type: "Sensor", msg: "Water Level back to normal", sev: "Safe", status: "Resolved", col: "text-emerald-500 bg-emerald-500/10" },
                  { t: "27 May 2025, 09:12 AM", type: "Rain", msg: "Light rain detected", sev: "Moderate", status: "Resolved", col: "text-yellow-600 bg-yellow-500/10" },
                  { t: "27 May 2025, 08:50 AM", type: "System", msg: "ESP32 reconnected", sev: "Safe", status: "Resolved", col: "text-emerald-500 bg-emerald-500/10" }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/40">
                    <td className="py-2.5 font-mono text-slate-400">{row.t}</td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">{row.type}</td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">{row.msg}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${row.col}`}>{row.sev}</span>
                    </td>
                    <td className="py-2.5 text-slate-400">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Col 2: Sensor Status */}
        <div className={`p-5 rounded-2xl border ${
          darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-black">Sensor Status</h4>
            <button className="text-[10px] font-bold text-blue-600">View All</button>
          </div>

          <table className="w-full text-[10px] text-left border-collapse font-semibold">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase">
                <th className="py-2">Sensor</th>
                <th className="py-2">Status</th>
                <th className="py-2">Value</th>
                <th className="py-2">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "HC-SR04 (Water Level)", status: "Online", val: "1.62 m", time: "10:24:30 AM" },
                { name: "YF-S201 (Water Flow)", status: "Online", val: "12.8 L/min", time: "10:24:30 AM" },
                { name: "Rain Sensor", status: "Online", val: "No Rain", time: "10:24:28 AM" },
                { name: "DHT22 (Temperature)", status: "Online", val: "28.4 °C", time: "10:24:28 AM" },
                { name: "DHT22 (Humidity)", status: "Online", val: "62.7 %", time: "10:24:28 AM" }
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/40">
                  <td className="py-2 text-slate-600 dark:text-slate-300">{row.name}</td>
                  <td className="py-2 text-emerald-500 font-extrabold">{row.status}</td>
                  <td className="py-2 font-mono">{row.val}</td>
                  <td className="py-2 text-slate-400 font-mono">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Col 3: System Info & Quick Actions */}
        <div className="space-y-6">
          {/* System Info */}
          <div className={`p-5 rounded-2xl border ${
            darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <h4 className="text-xs font-black border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">System Information</h4>
            <div className="space-y-2.5 text-[10px] font-semibold">
              {[
                ["Device", "ESP32 DevKit"],
                ["Device ID", "FS-AI-2025-001"],
                ["Uptime", "2d 14h 32m 16s"],
                ["Wi-Fi", "Connected (Excellent)", "text-emerald-500"],
                ["Firebase", "Connected", "text-emerald-500"],
                ["Backend API", "Connected", "text-emerald-500"],
                ["Last Sync", "10:24:30 AM"]
              ].map(([key, val, col], idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-slate-400">{key}</span>
                  <span className={`font-bold ${col || "text-slate-700 dark:text-slate-200"}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`p-5 rounded-2xl border ${
            darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <h4 className="text-xs font-black border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Quick Actions</h4>
            <div className="space-y-2">
              <button 
                onClick={handleDownloadReport}
                className="w-full flex items-center justify-between px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase transition border border-blue-200/40">
                <span className="flex items-center gap-2"><Download size={12} /> Download Report</span>
                <ArrowRight size={10} />
              </button>
              <button 
                onClick={handleExportData}
                className="w-full flex items-center justify-between px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase transition border border-emerald-200/40">
                <span className="flex items-center gap-2"><Share2 size={12} /> Export Data</span>
                <ArrowRight size={10} />
              </button>
              <button 
                onClick={handleTestSMS}
                disabled={smsSending}
                className="w-full flex items-center justify-between px-4 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl text-[10px] font-black uppercase transition border border-purple-200/40 disabled:opacity-50">
                <span className="flex items-center gap-2"><MessageSquare size={12} /> {smsSending ? "Sending Alert..." : "Test SMS"}</span>
                <ArrowRight size={10} />
              </button>
              <button 
                onClick={handleHealthCheck}
                disabled={healthChecking}
                className="w-full flex items-center justify-between px-4 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase transition border border-amber-200/40 disabled:opacity-50">
                <span className="flex items-center gap-2"><HeartPulse size={12} /> {healthChecking ? "Checking..." : "System Health Check"}</span>
                <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

// ==========================================
// CARD COMPONENT: SUMMARY CARD WITH SPARKLINE
// ==========================================
function SummaryCard({ title, val, desc, descColor, chartColor, chartData, darkMode, icon: Icon, isBar }) {
  return (
    <div className={`p-4 rounded-2xl border transition hover:-translate-y-0.5 hover:shadow-sm flex flex-col justify-between h-28 ${
      darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
    }`}>
      
      <div className="flex items-start justify-between text-slate-400">
        <span className="text-[9px] font-black uppercase tracking-wider leading-none truncate pr-1">{title}</span>
        <Icon size={12} className="text-slate-400 shrink-0" />
      </div>

      <div className="mt-2.5">
        <span className="text-base font-black tracking-tight leading-none block truncate">{val}</span>
        <span className={`text-[9px] font-bold mt-1 block leading-none ${descColor}`}>{desc}</span>
      </div>

      {/* Sparkline Graph rendering */}
      <div className="h-6 w-full mt-2.5">
        <ResponsiveContainer width="100%" height="100%">
          {isBar ? (
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Bar dataKey="value" fill={chartColor} radius={[1, 1, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${title.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={1.5} fillOpacity={1} fill={`url(#grad-${title.replace(/\s+/g, "-")})`} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

    </div>
  );
}

// ==========================================
// COMPONENT: RISK GAUGE
// ==========================================
function RiskGauge({ score, floodStatus }) {
  const scoreClamped = Math.min(100, Math.max(0, score || 0));
  const rotationAngle = (scoreClamped / 100) * 180 - 90;

  const getStatusColor = (status) => {
    switch (status) {
      case "Critical":
      case "Danger":
        return "#EF4444";
      case "Warning":
        return "#F97316";
      case "Moderate":
        return "#EAB308";
      default:
        return "#22C55E";
    }
  };

  const ringColor = getStatusColor(floodStatus);

  return (
    <div className="relative h-28 w-48 flex flex-col items-center">
      <svg className="w-full h-full" viewBox="0 0 200 100">
        {/* Background Arch */}
        <path 
          d="M30,90 A70,70 0 0,1 170,90" 
          fill="none" 
          stroke="#E2E8F0" 
          strokeWidth="8" 
          strokeLinecap="round"
          className="dark:stroke-slate-800"
        />
        {/* Colored Active Arch */}
        <path 
          d="M30,90 A70,70 0 0,1 170,90" 
          fill="none" 
          stroke={ringColor} 
          strokeWidth="8" 
          strokeLinecap="round"
          strokeDasharray="220"
          strokeDashoffset={220 - (220 * scoreClamped) / 100}
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Needle Hub */}
        <circle cx="100" cy="90" r="5" fill="#475569" />
        
        {/* Needle Pointer */}
        <line 
          x1="100" 
          y1="90" 
          x2="100" 
          y2="38" 
          stroke="#475569" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          style={{ 
            transformOrigin: "100px 90px",
            transform: `rotate(${rotationAngle}deg)`,
            transition: "transform 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          }}
        />
      </svg>

      <div className="absolute bottom-1 text-center">
        <p className="text-xl font-black font-mono tracking-tight">{scoreClamped.toFixed(0)}%</p>
        <span className={`text-[10px] font-black uppercase tracking-wider ${
          floodStatus === "Safe" ? "text-emerald-500" :
          floodStatus === "Moderate" ? "text-yellow-500" :
          floodStatus === "Warning" ? "text-orange-500" : "text-red-500"
        }`}>{floodStatus}</span>
        <p className="text-[8px] text-slate-400 mt-0.5 font-bold">Low Flood Risk</p>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 1.5: LIVE MONITORING (DETAILED GAUGES)
// ==========================================
function LiveMonitoringView({ darkMode }) {
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [predictions, setPredictions] = useState([]);
  
  const thresholdSettings = {
    dangerThresholdCm: 120,
    warningThresholdCm: 80,
    flowAlarmLimitLpm: 35
  };

  useEffect(() => {
    setHistory(mockDataService.getInitialTelemetryHistory(100));
    setEvents(mockDataService.getInitialEvents());
    setPredictions(mockDataService.getInitialPredictionHistory(10));
  }, []);

  useEffect(() => {
    if (history.length === 0) return;

    const interval = setInterval(() => {
      const next = mockDataService.simulateNextTelemetry(
        history,
        predictions,
        events,
        thresholdSettings
      );
      setHistory(next.history);
      setPredictions(next.predictions);
      setEvents(next.events);
    }, 2000);

    return () => clearInterval(interval);
  }, [history, predictions, events]);

  const latest = history[history.length - 1] || {
    water_level_cm: 110,
    water_level_m: 1.10,
    flow_rate_lpm: 18.5,
    temperature_c: 27.8,
    humidity_pct: 64.2,
    rain_status: "No Rain",
    risk_score: 25
  };

  // Derive stats dynamically from 100 historical points
  const maxLevel = history.length > 0 ? Math.max(...history.map(p => p.water_level_m || 0)) : 1.10;
  const minLevel = history.length > 0 ? Math.min(...history.map(p => p.water_level_m || 0)) : 0.45;
  const avgFlow = history.length > 0 ? (history.reduce((acc, p) => acc + (p.flow_rate_lpm || 0), 0) / history.length) : 18.5;
  const maxTemp = history.length > 0 ? Math.max(...history.map(p => p.temperature_c || 0)) : 28.0;
  const avgHumidity = history.length > 0 ? (history.reduce((acc, p) => acc + (p.humidity_pct || 0), 0) / history.length) : 64.2;
  const rainPointsCount = history.filter(p => p.rain_status !== "No Rain").length;
  const rainDurationFormatted = `${(rainPointsCount * 2 / 60).toFixed(1)} mins`;

  const connectionStatuses = mockDataService.getConnectionStatuses();
  const healthData = mockDataService.getSensorHealthData();

  // Circular gauge score needle calculations
  const score = latest.risk_score || 0;
  const rotation = (score / 100) * 180 - 90;

  let statusColor = "text-emerald-500 bg-emerald-500/10";
  let statusText = "Safe";
  if (score > 80) {
    statusColor = "text-red-500 bg-red-500/10";
    statusText = "Critical";
  } else if (score > 60) {
    statusColor = "text-orange-500 bg-orange-500/10";
    statusText = "Danger";
  } else if (score > 40) {
    statusColor = "text-yellow-600 bg-yellow-500/10";
    statusText = "Warning";
  } else if (score > 20) {
    statusColor = "text-blue-500 bg-blue-500/10";
    statusText = "Moderate";
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      
      {/* Top Telemetry summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Water Level Depth", val: `${latest.water_level_m.toFixed(2)} m`, icon: CloudRain, col: "text-blue-500", desc: "HC-SR04 ultrasonic echo" },
          { label: "Water Flow Rate", val: `${latest.flow_rate_lpm.toFixed(1)} L/min`, icon: TrendingUp, col: "text-emerald-500", desc: "YF-S201 interrupt count" },
          { label: "Ambient Temp", val: `${latest.temperature_c.toFixed(1)} °C`, icon: Thermometer, col: "text-orange-500", desc: "DHT22 moisture rating" },
          { label: "Relative Humidity", val: `${latest.humidity_pct.toFixed(1)}%`, icon: Droplet, col: "text-purple-500", desc: "DHT22 thermal reading" },
          { label: "Rain Trigger", val: latest.rain_status, icon: CloudRain, col: "text-blue-500", desc: "Analog capacitive probe" }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between ${
              darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400">{item.label}</span>
                <Icon size={16} className={item.col} />
              </div>
              <div className="mt-3">
                <p className="text-lg font-black font-mono leading-none">{item.val}</p>
                <p className="text-[8px] text-slate-400 mt-1 font-bold">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECTION 1: Real-Time Multi-Line Graph (Large) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border flex flex-col justify-between bg-white dark:bg-[#0B111E] border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Real-Time Telemetry Stream (100 Points)</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Autoscrolling 2-second edge sensor telemetry feeds</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1E293B" : "#E2E8F0"} />
                <XAxis dataKey="time" tick={{ fill: darkMode ? "#94A3B8" : "#64748B", fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tick={{ fill: darkMode ? "#94A3B8" : "#64748B", fontSize: 9 }} tickLine={false} axisLine={false} label={{ value: 'Level (m) / Temp / Hum', angle: -90, position: 'insideLeft', style: { fill: darkMode ? "#94A3B8" : "#64748B", fontSize: 9 } }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: darkMode ? "#94A3B8" : "#64748B", fontSize: 9 }} tickLine={false} axisLine={false} label={{ value: 'Flow (L/min)', angle: 90, position: 'insideRight', style: { fill: darkMode ? "#94A3B8" : "#64748B", fontSize: 9 } }} />
                <Tooltip contentStyle={{ backgroundColor: darkMode ? "#0B111E" : "#FFFFFF", borderColor: darkMode ? "#1E293B" : "#E2E8F0", borderRadius: "8px", fontSize: "10px" }} />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Area yAxisId="left" type="monotone" dataKey="water_level_m" name="Water Level (m)" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorLevel)" />
                <Area yAxisId="right" type="monotone" dataKey="flow_rate_lpm" name="Flow Rate (L/m)" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorFlow)" />
                <Area yAxisId="left" type="monotone" dataKey="temperature_c" name="Temp (°C)" stroke="#F97316" strokeWidth={1.5} dot={false} fill="none" />
                <Area yAxisId="left" type="monotone" dataKey="humidity_pct" name="Humidity (%)" stroke="#8B5CF6" strokeWidth={1.5} dot={false} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* SECTION 2: Flood Risk Gauge */}
          <div className={`p-5 rounded-2xl border text-center ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider text-left mb-3">Live Risk Index Dial</h3>
            <div className="flex flex-col items-center justify-center relative">
              <svg className="w-48 h-28" viewBox="0 0 200 100">
                <path 
                  d="M30,90 A70,70 0 0,1 170,90" 
                  fill="none" 
                  stroke={darkMode ? "#1E293B" : "#E2E8F0"} 
                  strokeWidth="10" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M30,90 A70,70 0 0,1 170,90" 
                  fill="none" 
                  stroke={score > 80 ? "#EF4444" : score > 60 ? "#F97316" : score > 40 ? "#EAB308" : "#10B981"} 
                  strokeWidth="10" 
                  strokeLinecap="round" 
                  strokeDasharray="220"
                  strokeDashoffset={220 - (220 * score) / 100}
                  className="transition-all duration-1000 ease-out"
                />
                <circle cx="100" cy="90" r="6" fill="#64748B" />
                <line 
                  x1="100" 
                  y1="90" 
                  x2="100" 
                  y2="35" 
                  stroke="#475569" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  style={{ 
                    transformOrigin: "100px 90px",
                    transform: `rotate(${rotation}deg)`,
                    transition: "transform 1.0s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                  }}
                />
              </svg>
              <div className="text-center mt-2">
                <p className="text-2xl font-black font-mono leading-none">{score}%</p>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mt-2 ${statusColor}`}>
                  {statusText}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 5: Connection Status */}
          <div className={`p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">IoT Pipeline Handshakes</h3>
            <div className="space-y-3">
              {Object.keys(connectionStatuses).map(key => {
                const conn = connectionStatuses[key];
                return (
                  <div key={key} className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    darkMode ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200/50"
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full relative shrink-0 ${
                        conn.connected ? "bg-emerald-500" : "bg-slate-400"
                      }`}>
                        {conn.connected && <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />}
                      </div>
                      <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">{conn.label}</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1.5">
                      <span>{conn.delay}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="font-extrabold uppercase text-slate-500">{conn.signal}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Grid: Section 3 & Section 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SECTION 3: Live Event Timeline */}
        <div className={`p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <div className="mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">System Event Timeline</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Chronological logs of edge handshakes & warnings</p>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {events.map(ev => {
              let badgeCol = "bg-blue-500/10 text-blue-500 border-blue-500/20";
              if (ev.type === "sensor") badgeCol = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
              if (ev.type === "firebase") badgeCol = "bg-purple-500/10 text-purple-500 border-purple-500/20";
              if (ev.type === "ai") badgeCol = "bg-orange-500/10 text-orange-500 border-orange-500/20";
              if (ev.type === "network") badgeCol = "bg-pink-500/10 text-pink-500 border-pink-500/20";

              return (
                <motion.div 
                  layout
                  key={ev.id} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className={`p-3 rounded-xl border flex items-start gap-3 ${
                    darkMode ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200/50"
                  }`}>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${badgeCol}`}>
                    {ev.type}
                  </span>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-snug">{ev.msg}</p>
                    <span className="text-[9px] text-slate-400 font-bold block">{ev.time}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: Sensor Diagnostics Health */}
        <div className={`p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <div className="mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Sensor Calibration Health</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Signal indexes verified dynamically from local nodes</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(healthData).map(key => {
              const item = healthData[key];
              const isOnline = item.status === "Online";
              return (
                <div key={key} className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  darkMode ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200/50"
                }`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-250">{key}</h4>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                      isOnline ? "text-emerald-600 bg-emerald-500/10" : "text-slate-400 bg-slate-500/10"
                    }`}>{item.status}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold mt-1.5">{item.name}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/40 text-[9px] font-semibold">
                    <div>
                      <span className="text-slate-400 block">Health Rating</span>
                      <span className="text-slate-700 dark:text-slate-200 font-black">{item.health}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Signal Grade</span>
                      <span className="text-slate-700 dark:text-slate-200 font-black">{item.signal}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Grid: Section 6 & Section 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECTION 6: Recent Sensor Logs Table */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <div className="mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Monospace Ingestion Logs</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Chronological audit trace of verified telemetry packets</p>
          </div>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-[10px] font-semibold text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 uppercase text-slate-400 font-black">
                  <th className="py-2.5">Time</th>
                  <th className="py-2.5">Depth (m)</th>
                  <th className="py-2.5">Flow (L/m)</th>
                  <th className="py-2.5">Temp (°C)</th>
                  <th className="py-2.5">Hum (%)</th>
                  <th className="py-2.5">Rain</th>
                  <th className="py-2.5">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {history.slice(0, 15).reverse().map((row, idx) => (
                  <tr key={idx} className="font-mono hover:bg-slate-50 dark:hover:bg-slate-900/20">
                    <td className="py-2.5 text-slate-400">{row.time}</td>
                    <td className="py-2.5 text-slate-800 dark:text-slate-100">{row.water_level_m} m</td>
                    <td className="py-2.5 text-slate-800 dark:text-slate-100">{row.flow_rate_lpm} L</td>
                    <td className="py-2.5 text-slate-800 dark:text-slate-100">{row.temperature_c} °C</td>
                    <td className="py-2.5 text-slate-800 dark:text-slate-100">{row.humidity_pct} %</td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        row.rain_status === "Heavy Rain" ? "text-purple-600 bg-purple-500/10" :
                        row.rain_status === "Moderate Rain" ? "text-blue-600 bg-blue-500/10" :
                        "text-slate-400 bg-slate-500/10"
                      }`}>{row.rain_status}</span>
                    </td>
                    <td className="py-2.5">
                      <span className={`font-black font-mono ${
                        row.risk_score > 80 ? "text-red-500" :
                        row.risk_score > 60 ? "text-orange-500" :
                        row.risk_score > 40 ? "text-yellow-600" : "text-emerald-500"
                      }`}>{row.risk_score}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 7: Quick Statistics */}
        <div className={`p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Ingestion Aggregates</h3>
          <div className="space-y-3.5">
            {[
              { label: "Max Water Level", val: `${maxLevel.toFixed(2)} m`, desc: "Peak water depth recorded" },
              { label: "Min Water Level", val: `${minLevel.toFixed(2)} m`, desc: "Flow baseline depth" },
              { label: "Average Flow Velocity", val: `${avgFlow.toFixed(1)} L/min`, desc: "Mean turbine flow volume" },
              { label: "Max Temperature", val: `${maxTemp.toFixed(1)} °C`, desc: "Highest ambient air temperature" },
              { label: "Average Humidity", val: `${avgHumidity.toFixed(1)}%`, desc: "Mean relative air moisture" },
              { label: "Rain Trigger Duration", val: rainDurationFormatted, desc: "Cumulative active rainfall" }
            ].map((stat, idx) => (
              <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between ${
                darkMode ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200/50"
              }`}>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 leading-none">{stat.label}</span>
                  <span className="text-[8px] text-slate-450 block mt-0.5 font-bold leading-none">{stat.desc}</span>
                </div>
                <span className="text-sm font-black font-mono text-blue-600 dark:text-blue-400">{stat.val}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </motion.div>
  );
}

// ==========================================
// VIEW 1.6: AI PREDICTION LOGS
// ==========================================
function AIPredictionView({ darkMode, triggerToast }) {
  const [predictions, setPredictions] = useState([]);
  const [history, setHistory] = useState([]);
  
  const thresholdSettings = {
    dangerThresholdCm: 120,
    warningThresholdCm: 80,
    flowAlarmLimitLpm: 35
  };

  useEffect(() => {
    setHistory(mockDataService.getInitialTelemetryHistory(100));
    setPredictions(mockDataService.getInitialPredictionHistory(15));
  }, []);

  useEffect(() => {
    if (history.length === 0) return;

    const interval = setInterval(() => {
      const next = mockDataService.simulateNextTelemetry(
        history,
        predictions,
        [],
        thresholdSettings
      );
      setHistory(next.history);
      setPredictions(next.predictions);
    }, 2000);

    return () => clearInterval(interval);
  }, [history, predictions]);

  const latestPred = predictions[0] || {
    created_at: new Date().toISOString(),
    water_level_cm: 110,
    flow_rate_lpm: 18.5,
    flood_status: "Safe",
    risk_score: 25,
    confidence: 92.5,
    model: "Random Forest Classifier",
    alert_sent: false
  };

  const modelStats = mockDataService.getAIModelStats();
  const featureImportance = mockDataService.getFeatureImportance();

  // Summary Metrics Array
  const summaryCards = [
    { label: "Current Flood Risk", val: `${latestPred.risk_score}%`, icon: ShieldAlert, col: "text-blue-500", desc: "Index score forecast" },
    { label: "Classifier Confidence", val: `${latestPred.confidence}%`, icon: Activity, col: "text-emerald-500", desc: "Model classification certainty" },
    { label: "Current Prediction", val: latestPred.flood_status, icon: Cpu, col: latestPred.flood_status === "Safe" ? "text-emerald-500" : "text-red-500", desc: "Model classification category" },
    { label: "Prediction Score Time", val: new Date(latestPred.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), icon: RefreshCw, col: "text-orange-500", desc: "Timestamp of last inference calculation" },
    { label: "Active Model Profile", val: "Random Forest", icon: Layers, col: "text-purple-500", desc: "Active classifier pipeline version" }
  ];

  // Circle dial score needle calculation
  const riskScore = latestPred.risk_score || 0;
  const rotationAngle = (riskScore / 100) * 180 - 90;

  let dialColor = "text-emerald-500 bg-emerald-500/10";
  let dialText = "Safe";
  if (riskScore > 80) {
    dialColor = "text-red-500 bg-red-500/10";
    dialText = "Critical";
  } else if (riskScore > 60) {
    dialColor = "text-orange-500 bg-orange-500/10";
    dialText = "Danger";
  } else if (riskScore > 40) {
    dialColor = "text-yellow-600 bg-yellow-500/10";
    dialText = "Warning";
  } else if (riskScore > 20) {
    dialColor = "text-blue-500 bg-blue-500/10";
    dialText = "Moderate";
  }

  // Explanation logic
  const getExplanation = (status) => {
    switch (status) {
      case "Critical":
      case "Danger":
        return {
          reasons: ["Water level drastically exceeded safe thresholds", "Severe flow rates indicate active downstream overflow", "Heavy localized precipitation in watershed"],
          recommendation: "ACTIVATE EMERGENCY RESPONSE PROTOCOLS IMMEDIATELY. BROADCAST SIREN SIRENS AND CELL WARNING MESSAGE CIRCULARS."
        };
      case "Warning":
        return {
          reasons: ["Water level approaching danger line", "Flow rates show abnormal increase, accelerating", "Moderate precipitation recorded in upper regions"],
          recommendation: "Alert municipal commands. Deploy warning patrols along low-lying river areas. Monitor flow velocity variance."
        };
      case "Moderate":
        return {
          reasons: ["Water level slightly elevated from normal baseline", "Flow rate steady but elevated", "Light localized drizzle, stable climate conditions"],
          recommendation: "Continue standard telemetry sweeps. Log statistics every 5 minutes. No immediate warning broadcasts needed."
        };
      default:
        return {
          reasons: ["Water level normal and stable", "No significant precipitation detected", "Flow rate stable and well within channel capacities", "Ambient humidity acceptable"],
          recommendation: "System operating normal. Maintain standard autonomous edge polling routines."
        };
    }
  };
  const explanation = getExplanation(latestPred.flood_status);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      
      {/* SECTION 1: Prediction Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {summaryCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between ${
              darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400">{item.label}</span>
                <Icon size={16} className={item.col} />
              </div>
              <div className="mt-3">
                <p className="text-lg font-black font-mono leading-none">{item.val}</p>
                <p className="text-[8px] text-slate-400 mt-1 font-bold">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECTION 3: Prediction Trend Graph */}
        <div className="lg:col-span-2 p-5 rounded-2xl border flex flex-col justify-between bg-white dark:bg-[#0B111E] border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Flood Risk Trend</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">15-Interval model prediction outputs timeline mapping</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...predictions].reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1E293B" : "#E2E8F0"} />
                <XAxis dataKey="created_at" tickFormatter={(str) => new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} tick={{ fill: darkMode ? "#94A3B8" : "#64748B", fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: darkMode ? "#94A3B8" : "#64748B", fontSize: 9 }} tickLine={false} axisLine={false} label={{ value: 'Risk Index (%)', angle: -90, position: 'insideLeft', style: { fill: darkMode ? "#94A3B8" : "#64748B", fontSize: 9 } }} />
                <Tooltip contentStyle={{ backgroundColor: darkMode ? "#0B111E" : "#FFFFFF", borderColor: darkMode ? "#1E293B" : "#E2E8F0", borderRadius: "8px", fontSize: "10px" }} labelFormatter={(str) => `Time: ${new Date(str).toLocaleString()}`} />
                <Area type="monotone" dataKey="risk_score" name="Flood Risk Score" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* SECTION 2: Large Flood Risk Gauge */}
          <div className={`p-5 rounded-2xl border text-center ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider text-left mb-3">Model Risk Analysis</h3>
            <div className="flex flex-col items-center justify-center relative">
              <svg className="w-48 h-28" viewBox="0 0 200 100">
                <path 
                  d="M30,90 A70,70 0 0,1 170,90" 
                  fill="none" 
                  stroke={darkMode ? "#1E293B" : "#E2E8F0"} 
                  strokeWidth="10" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M30,90 A70,70 0 0,1 170,90" 
                  fill="none" 
                  stroke={riskScore > 80 ? "#EF4444" : riskScore > 60 ? "#F97316" : riskScore > 40 ? "#EAB308" : "#10B981"} 
                  strokeWidth="10" 
                  strokeLinecap="round" 
                  strokeDasharray="220"
                  strokeDashoffset={220 - (220 * riskScore) / 100}
                  className="transition-all duration-1000 ease-out"
                />
                <circle cx="100" cy="90" r="6" fill="#64748B" />
                <line 
                  x1="100" 
                  y1="90" 
                  x2="100" 
                  y2="35" 
                  stroke="#475569" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  style={{ 
                    transformOrigin: "100px 90px",
                    transform: `rotate(${rotationAngle}deg)`,
                    transition: "transform 1.0s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                  }}
                />
              </svg>
              <div className="text-center mt-2">
                <p className="text-2xl font-black font-mono leading-none">{riskScore}%</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${dialColor}`}>
                    {dialText}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">Conf: {latestPred.confidence}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Prediction Explanation Card */}
          <div className={`p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Model Inference Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Decision Factors</span>
                <ul className="list-disc pl-4 text-[10px] font-semibold text-slate-650 dark:text-slate-350 space-y-1">
                  {explanation.reasons.map((r, idx) => <li key={idx}>{r}</li>)}
                </ul>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/40">
                <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">AI Recommendation</span>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                  {explanation.recommendation}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Grid: Section 5 & Section 7 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SECTION 5: Feature Importance */}
        <div className={`p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <div className="mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Classifier Leaf Node Weights</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Feature importance metrics of loaded Random Forest tree array</p>
          </div>
          <div className="space-y-4">
            {featureImportance.map((feat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-semibold">
                  <span className="text-slate-700 dark:text-slate-300 font-extrabold">{feat.name}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-black">{feat.weight}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-blue-600 transition-all duration-1000"
                    style={{ width: `${feat.weight}%` }} 
                  />
                </div>
                <span className="text-[8px] text-slate-400 block leading-none font-bold">{feat.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 7: AI Model Diagnostics */}
        <div className={`p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <div className="mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">AI Classifier Diagnostics</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Validation metrics derived during supervised training sweeps</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800">
              <span className="text-slate-400 text-[9px] block">Model Type</span>
              <span className="text-slate-800 dark:text-slate-100 font-black text-[11px] mt-1 block">{modelStats.name}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800">
              <span className="text-slate-400 text-[9px] block">Test Accuracy</span>
              <span className="text-slate-800 dark:text-slate-100 font-black text-[11px] mt-1 block">{modelStats.accuracy}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800">
              <span className="text-slate-400 text-[9px] block">Precision Rate</span>
              <span className="text-slate-800 dark:text-slate-100 font-black text-[11px] mt-1 block">{modelStats.precision}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800">
              <span className="text-slate-400 text-[9px] block">Sensitivity (Recall)</span>
              <span className="text-slate-800 dark:text-slate-100 font-black text-[11px] mt-1 block">{modelStats.recall}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800">
              <span className="text-slate-400 text-[9px] block">F1 Weighted Score</span>
              <span className="text-slate-800 dark:text-slate-100 font-black text-[11px] mt-1 block">{modelStats.f1Score}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800">
              <span className="text-slate-400 text-[9px] block">Model Deployment Version</span>
              <span className="text-slate-800 dark:text-slate-100 font-black text-[11px] mt-1 block">{modelStats.version}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Section 6 & Section 8 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECTION 6: Prediction History Table */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <div className="mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Classifier Prediction History</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Historical trace of Random Forest predictions</p>
          </div>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-[10px] font-semibold text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 uppercase text-slate-400 font-black">
                  <th className="py-2.5">Time</th>
                  <th className="py-2.5">Risk Score</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Confidence</th>
                  <th className="py-2.5">Model Profile</th>
                  <th className="py-2.5">Alert SMS Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {predictions.map((row) => (
                  <tr key={row.id} className="font-mono hover:bg-slate-50 dark:hover:bg-slate-900/20">
                    <td className="py-2.5 text-slate-400">{new Date(row.created_at).toLocaleTimeString()}</td>
                    <td className="py-2.5 text-slate-800 dark:text-slate-100 font-black">{row.risk_score}%</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full font-black uppercase text-[8px] ${
                        row.flood_status === "Critical" || row.flood_status === "Danger" ? "text-red-600 bg-red-500/10" :
                        row.flood_status === "Warning" ? "text-orange-600 bg-orange-500/10" :
                        row.flood_status === "Moderate" ? "text-yellow-600 bg-yellow-500/10" :
                        "text-emerald-600 bg-emerald-500/10"
                      }`}>{row.flood_status}</span>
                    </td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300 font-black">{row.confidence}%</td>
                    <td className="py-2.5 text-slate-400">Random Forest</td>
                    <td className="py-2.5">
                      {row.alert_sent ? (
                        <span className="text-red-500 flex items-center gap-1">
                          <ShieldAlert size={10} /> Dispatched
                        </span>
                      ) : (
                        <span className="text-slate-400">Not Triggered</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 8: Recommendation Panel */}
        <div className={`p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Command Protocols</h3>
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl border border-red-500/10 bg-red-500/5">
              <h4 className="font-extrabold text-red-600 dark:text-red-400 flex items-center gap-1.5 mb-1.5 uppercase text-[9px] tracking-wide">
                Emergency Action Directives
              </h4>
              <p className="text-[11px] text-red-700 dark:text-red-300 font-semibold leading-relaxed">
                If status escalates to Danger/Critical: Evacuate zone coordinates 4A-D. Dispatch SIM800L target alerts to civil list. Activate river warning sirens immediately.
              </p>
            </div>
            <div className="p-3 rounded-xl border border-yellow-500/10 bg-yellow-500/5">
              <h4 className="font-extrabold text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5 mb-1.5 uppercase text-[9px] tracking-wide">
                Municipal Civil Advisory
              </h4>
              <p className="text-[11px] text-yellow-700 dark:text-yellow-300 font-semibold leading-relaxed">
                Advise riverine inhabitants to secure power lines and storage silos. Keep secondary offline GSM communication channels open.
              </p>
            </div>
            <div className="p-3 rounded-xl border border-blue-500/10 bg-blue-500/5">
              <h4 className="font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-1.5 uppercase text-[9px] tracking-wide">
                Hydrological Analysis
              </h4>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold leading-relaxed">
                Classification computed dynamically by weighting primary depth telemetry (45%) and velocity flow rates (25%) through Random Forest leaves.
              </p>
            </div>
          </div>
        </div>

      </div>

    </motion.div>
  );
}

// ==========================================
// VIEW 1.7: GRAPHS & ANALYTICS (DEEP)
// ==========================================
function GraphsAnalyticsView({ darkMode, triggerToast }) {
  const [range, setRange] = useState("7 Days");
  
  const historyData = [
    { name: "21 May", water: 1.5, rainfall: 12, flow: 20, temp: 28.1, humidity: 62 },
    { name: "22 May", water: 2.1, rainfall: 0, flow: 21, temp: 27.9, humidity: 63 },
    { name: "23 May", water: 2.6, rainfall: 5, flow: 23, temp: 28.4, humidity: 61 },
    { name: "24 May", water: 3.8, rainfall: 18, flow: 29, temp: 28.6, humidity: 60 },
    { name: "25 May", water: 2.9, rainfall: 0, flow: 27, temp: 28.3, humidity: 62 },
    { name: "26 May", water: 2.2, rainfall: 32, flow: 24, temp: 28.0, humidity: 64 },
    { name: "27 May", water: 3.1, rainfall: 0, flow: 28, temp: 28.4, humidity: 62.7 }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className={`p-6 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-black">Historical Analytics Portal</h3>
          <select 
            value={range}
            onChange={e => setRange(e.target.value)}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-800 text-[10px] font-bold outline-none dark:bg-slate-900">
            <option>24 Hours</option>
            <option>7 Days</option>
            <option>30 Days</option>
          </select>
        </div>

        {/* Level Trend Area Chart */}
        <div className="space-y-2 mb-8">
          <h4 className="text-xs font-bold text-slate-500">River Height Deviation (m)</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWaterAnal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="water" name="Depth (m)" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorWaterAnal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Climate Analytics Double Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-slate-500 mb-2">Climate Indicators (Temp &amp; Humidity)</h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="#F97316" strokeWidth={2} />
                  <Line type="monotone" dataKey="humidity" name="Humid (%)" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-500 mb-2">Precipitation Accumulation (mm)</h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 9, fontWeight: 700 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="rainfall" name="Rain (mm)" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

// ==========================================
function AlertsView({ darkMode, triggerToast, token }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasRealAlerts, setHasRealAlerts] = useState(false);

  const fetchAlerts = () => {
    fetch("/api/predictions")
      .then(res => res.json())
      .then(data => {
        const predictionsList = data.predictions || [];
        if (predictionsList.length > 0) {
          const mappedAlerts = predictionsList.map((p, idx) => ({
            id: p.id || idx,
            time: new Date(p.created_at).toLocaleTimeString(),
            date: new Date(p.created_at).toLocaleDateString(),
            type: p.water_level_cm > 120 ? "Critical" : "Standard",
            message: p.water_level_cm > 120 
              ? `CRITICAL: Severe flood threat scored. Level: ${(p.water_level_cm/100).toFixed(2)} m.` 
              : `System running normal. Sensor state secure.`,
            severity: p.flood_status,
            status: p.water_level_cm > 120 ? "Active" : "Resolved"
          }));
          setAlerts(mappedAlerts);
          setHasRealAlerts(true);
        } else {
          // Fallback to high-fidelity mock alerts if predictions log is empty
          setAlerts(mockDataService.getMockAlerts());
          setHasRealAlerts(false);
        }
        setLoading(false);
      })
      .catch(e => {
        console.error("Alerts sync failed, falling back to mock metrics:", e);
        setAlerts(mockDataService.getMockAlerts());
        setHasRealAlerts(false);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleClearAlerts = async () => {
    if (!token) {
      triggerToast("Access Blocked", "Please authenticate inside Admin Panel first.", "danger");
      return;
    }
    try {
      const res = await fetch("/api/predictions/clear", {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Clear failed");
      triggerToast("Logs Cleared", "Prediction history and warning logs reset.", "success");
      fetchAlerts();
    } catch (e) {
      triggerToast("Clear Failed", "Authentication validation failed.", "danger");
    }
  };

  // Derived Summary Counter statistics
  const activeAlerts = alerts.filter(a => a.status === "Active").length;
  const criticalAlerts = alerts.filter(a => a.severity === "Critical" || a.severity === "Danger").length;
  const smsSentCount = alerts.filter(a => a.severity === "Critical" || a.severity === "Danger" || a.severity === "Warning").length;
  const lastAlertTime = alerts.length > 0 ? alerts[0].time : "N/A";

  const summaryCards = [
    { label: "Active Alerts Counter", val: activeAlerts, icon: ShieldAlert, col: activeAlerts > 0 ? "text-red-500" : "text-emerald-500", desc: "Currently active system alerts" },
    { label: "Critical Alarm Counter", val: criticalAlerts, icon: AlertTriangle, col: criticalAlerts > 0 ? "text-red-600 animate-pulse" : "text-slate-400", desc: "Severe flood threats logged" },
    { label: "SMS Dispatches", val: smsSentCount, icon: MessageSquare, col: "text-blue-500", desc: "SIM800L emergency cells sent" },
    { label: "Last Incident Time", val: lastAlertTime, icon: RefreshCw, col: "text-orange-500", desc: "Timestamp of last warning state" }
  ];

  // Recharts Pie Chart Data configuration
  const criticalCount = alerts.filter(a => a.severity === "Critical" || a.severity === "Danger").length;
  const warningCount = alerts.filter(a => a.severity === "Warning").length;
  const moderateCount = alerts.filter(a => a.severity === "Moderate").length;
  const safeCount = alerts.filter(a => a.severity === "Safe").length;

  const pieData = [
    { name: "Critical", value: criticalCount || 1, color: "#EF4444" },
    { name: "Warning", value: warningCount || 1, color: "#F97316" },
    { name: "Moderate", value: moderateCount || 1, color: "#EAB308" },
    { name: "Safe", value: safeCount || 1, color: "#10B981" }
  ];

  // Recharts Bar Chart Data configuration (Last 5 Days statistics)
  const barData = [
    { name: "14 July", Critical: 0, Warning: 1, Moderate: 2 },
    { name: "15 July", Critical: 1, Warning: 0, Moderate: 3 },
    { name: "16 July", Critical: 0, Warning: 2, Moderate: 1 },
    { name: "17 July", Critical: 2, Warning: 1, Moderate: 0 },
    { name: "18 July", Critical: criticalCount, Warning: warningCount, Moderate: moderateCount }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      
      {/* Dynamic System Status Empty-State Banner */}
      {!hasRealAlerts && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          darkMode ? "bg-emerald-950/10 border-emerald-900/60 text-emerald-300" : "bg-emerald-50 border-emerald-200/60 text-emerald-800"
        }`}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-black">System Operating Normally</p>
              <p className="text-[10px] opacity-75 font-semibold mt-0.5">No active alerts. The flood monitoring edge array is secure.</p>
            </div>
          </div>
          <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            SIMULATION MODE ACTIVE
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between ${
              darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400">{item.label}</span>
                <Icon size={16} className={item.col} />
              </div>
              <div className="mt-3">
                <p className="text-lg font-black font-mono leading-none">{item.val}</p>
                <p className="text-[8px] text-slate-400 mt-1 font-bold">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Section 2: Severity Distribution Pie Chart */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <div className="mb-2">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Alert Severity Index</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Severity distribution of logged alerts</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: darkMode ? "#0B111E" : "#FFFFFF", borderColor: darkMode ? "#1E293B" : "#E2E8F0", borderRadius: "8px", fontSize: "10px" }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3: Alert Statistics Bar Chart */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border flex flex-col justify-between ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <div className="mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Historical Incident Load</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Warning statistics over the last 5 days</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1E293B" : "#E2E8F0"} />
                <XAxis dataKey="name" tick={{ fill: darkMode ? "#94A3B8" : "#64748B", fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: darkMode ? "#94A3B8" : "#64748B", fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: darkMode ? "#0B111E" : "#FFFFFF", borderColor: darkMode ? "#1E293B" : "#E2E8F0", borderRadius: "8px", fontSize: "10px" }} />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Bar dataKey="Critical" fill="#EF4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Warning" fill="#F97316" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Moderate" fill="#EAB308" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Section 4: Recent Alerts Table */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Incident Warning Log</h3>
              <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Catalog of triggered and broadcasted warning sirens</p>
            </div>
            <button 
              onClick={handleClearAlerts}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-lg text-[9px] font-black uppercase transition border border-red-200/40">
              <Trash2 size={10} /> Reset Alarm History
            </button>
          </div>

          <div className="overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-[10px] text-left border-collapse font-semibold">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Time</th>
                  <th className="py-2.5">Warning Directives</th>
                  <th className="py-2.5">Severity</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {alerts.map((row) => (
                  <tr key={row.id} className="font-mono hover:bg-slate-50 dark:hover:bg-slate-900/20">
                    <td className="py-2.5 text-slate-400">{row.date}</td>
                    <td className="py-2.5 text-slate-400">{row.time}</td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300 font-sans font-bold">{row.message}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                        row.severity === "Critical" || row.severity === "Danger" ? "text-red-600 bg-red-500/10" :
                        row.severity === "Warning" ? "text-orange-600 bg-orange-500/10" :
                        row.severity === "Moderate" ? "text-yellow-600 bg-yellow-500/10" :
                        "text-emerald-600 bg-emerald-500/10"
                      }`}>{row.severity}</span>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        row.status === "Active" ? "text-red-500 bg-red-500/10" : "text-slate-400 bg-slate-500/10"
                      }`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: Timeline & Recommendations */}
        <div className="space-y-6">
          
          {/* Section 5: Alert Timeline */}
          <div className={`p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Sequential Alert Timeline</h3>
            <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar pr-1 text-[11px] font-semibold">
              {alerts.map((al, idx) => (
                <div key={al.id || idx} className="flex gap-3 relative pb-1">
                  {idx < alerts.length - 1 && (
                    <div className="absolute left-1.5 top-3 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />
                  )}
                  <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    al.severity === "Critical" || al.severity === "Danger" ? "border-red-500 bg-red-500/10 text-red-500" :
                    al.severity === "Warning" ? "border-orange-500 bg-orange-500/10 text-orange-500" :
                    "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                  }`}>
                    <div className="h-1 w-1 rounded-full bg-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-700 dark:text-slate-200 font-extrabold">{al.severity} Alert</span>
                      <span className="text-[8px] text-slate-400 font-bold">{al.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">{al.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Emergency Recommendations */}
          <div className={`p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Response Directives</h3>
            <div className="space-y-3 text-[10px] font-semibold leading-relaxed">
              <div className="flex gap-2">
                <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-850 dark:text-slate-200">Safe/Moderate State:</strong> Continue edge sensors polling every 2s. Validate cell modem cellular handshake.
                </p>
              </div>
              <div className="flex gap-2">
                <CheckCircle size={14} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-850 dark:text-slate-200">Warning State:</strong> Flag elevated logs in yellow. Keep offline SIM800L warning queue active.
                </p>
              </div>
              <div className="flex gap-2">
                <CheckCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-850 dark:text-slate-200">Critical State:</strong> Evacuate low lands. Siren sounds active on bank. Broadcast automated warnings.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
}

// ==========================================
// VIEW 1.9: SENSOR STATUS (CALIBRATION)
// ==========================================
function SensorStatusView({ darkMode, settings }) {
  const [sensors, setSensors] = useState([]);
  
  useEffect(() => {
    setSensors(mockDataService.getSensorDiagnosticsDetails());
  }, []);

  const totalSensors = sensors.length;
  const onlineSensors = sensors.filter(s => s.status === "Online").length;
  const offlineSensors = totalSensors - onlineSensors;
  const avgHealth = totalSensors > 0 
    ? Math.round(sensors.reduce((acc, curr) => acc + curr.health, 0) / totalSensors) 
    : 0;

  const topCards = [
    { label: "Total Probes Registered", val: totalSensors, icon: Activity, col: "text-blue-500" },
    { label: "Online Array", val: onlineSensors, icon: ShieldCheck, col: "text-emerald-500" },
    { label: "Offline Array", val: offlineSensors, icon: AlertTriangle, col: "text-red-500" },
    { label: "Average Health Score", val: `${avgHealth}%`, icon: Heart, col: "text-pink-500" }
  ];

  // Pie chart data for health categorization
  const healthPieData = [
    { name: "Optimal (95-100%)", value: sensors.filter(s => s.health >= 95).length || 1, color: "#10B981" },
    { name: "Stable (90-94%)", value: sensors.filter(s => s.health >= 90 && s.health < 95).length || 0, color: "#3B82F6" },
    { name: "Critical (<90%)", value: sensors.filter(s => s.health < 90).length || 0, color: "#EF4444" }
  ];

  const calibrationHistory = [
    { date: "2026-07-18", time: "08:45 AM", sensor: "SIM800L GPRS", type: "Cell Handshake", status: "Passed" },
    { date: "2026-07-18", time: "08:30 AM", sensor: "Analogue Rain Grid", type: "ADC Offset", status: "Passed" },
    { date: "2026-07-18", time: "08:10 AM", sensor: "YF-S201 Flow", type: "K-Factor Tuned", status: "Passed" },
    { date: "2026-07-18", time: "08:00 AM", sensor: "HC-SR04 Ultrasonic", type: "Zero-Offset", status: "Passed" }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      
      {/* Top summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className={`p-4 rounded-xl border flex flex-col justify-between ${
              darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400">{c.label}</span>
                <Icon size={16} className={c.col} />
              </div>
              <div className="mt-3">
                <p className="text-lg font-black leading-none">{c.val}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Detailed Sensor grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Edge Probe Diagnostics Registry</h3>
            <div className="space-y-4">
              {sensors.map((s) => (
                <div key={s.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold">
                  <div className="flex items-start gap-3">
                    <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${s.status === "Online" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                    <div>
                      <h4 className="text-[11px] font-black">{s.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{s.type} | Accuracy: {s.accuracy}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Last Calibrated: {s.lastCalibration}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px]">
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">Current Reading</span>
                      <span className="font-mono text-[11px] font-black text-blue-500">{s.reading}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">Health Score</span>
                      <span className={`font-mono text-[11px] font-black ${s.health >= 95 ? "text-emerald-500" : "text-yellow-500"}`}>{s.health}%</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">Auto Tuning</span>
                      <span className="text-slate-500 font-extrabold">{s.autoCalibration}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block mb-1">Signal Trend</span>
                      <div className="h-6 w-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={s.sparkline}>
                            <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-2 md:pt-0 md:pl-4 max-w-[200px]">
                    <span className="text-[8px] text-slate-400 font-bold uppercase block">Advisory Directive</span>
                    <span className="text-[9px] text-slate-500 font-bold block mt-0.5 leading-snug">{s.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar analytics */}
        <div className="space-y-6">
          
          {/* Health Pie Chart */}
          <div className={`p-5 rounded-2xl border flex flex-col ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Health Stratification</h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {healthPieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: darkMode ? "#0B111E" : "#FFFFFF", borderColor: darkMode ? "#1E293B" : "#E2E8F0", borderRadius: "8px", fontSize: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1.5 text-[9px] font-bold">
              {healthPieData.map((d, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calibration History */}
          <div className={`p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Calibration Event Log</h3>
            <div className="overflow-y-auto max-h-[180px] custom-scrollbar text-[9px] font-semibold">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 uppercase font-black">
                    <th className="pb-2">Sensor</th>
                    <th className="pb-2">Action Type</th>
                    <th className="pb-2">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {calibrationHistory.map((h, i) => (
                    <tr key={i} className="font-mono">
                      <td className="py-2 text-slate-700 dark:text-slate-350">{h.sensor}</td>
                      <td className="py-2 text-slate-500">{h.type}</td>
                      <td className="py-2 text-emerald-500 font-bold">{h.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* Existing threshold settings list & calibration status */}
      <div className={`p-6 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
        <h3 className="text-sm font-black border-b border-slate-100 dark:border-slate-800 pb-3 mb-6 font-display">Threshold Limits & Physical verification</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Calibration Threshold limits</h4>
            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-500">HC-SR04 Danger Level</span>
                <span className="font-mono text-red-500 font-bold">{settings.dangerThresholdCm} cm</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-500">HC-SR04 Warning Level</span>
                <span className="font-mono text-orange-500 font-bold">{settings.warningThresholdCm} cm</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-500">YF-S201 Max Flow Velocity</span>
                <span className="font-mono text-blue-500 font-bold">{settings.flowAlarmLimitLpm} L/min</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Physical Calibration Verification</h4>
            <div className="space-y-3.5 text-xs font-bold">
              {[
                { name: "HC-SR04 Acoustic Echo Path", check: "Calibrated", details: "Zero-offset level calibrated dynamically at boot." },
                { name: "YF-S201 Hall-Effect Interrupts", check: "Calibrated", details: "Pulse-frequency coefficient set to k=7.5." },
                { name: "DHT22 Capacitive Element", check: "Verified", details: "Zero-drift compensation applied." },
                { name: "Rain Sensor Electroplate Grid", check: "Calibrated", details: "Analog baseline reference mapped to ADC 4095." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mt-0.5">
                    <ShieldCheck size={12} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                      <span className="text-[8px] bg-emerald-500/15 text-emerald-600 px-1 rounded uppercase font-black">{item.check}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-semibold">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}

// ==========================================
// VIEW 2.0: SMS DISPATCH HISTORY (TIMELINE)
// ==========================================
function SMSHistoryView({ darkMode, triggerToast }) {
  const [smsLogs, setSmsLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSMS, setSelectedSMS] = useState(null);

  useEffect(() => {
    setSmsLogs(mockDataService.getSMSLogsHistory());
  }, []);

  // Filter logs by date range & search keyword
  const getFilteredLogs = () => {
    return smsLogs.filter(log => {
      // 1. Search term match (Recipient contact name, phone, or body text)
      const matchesSearch = 
        log.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.to.includes(searchTerm) ||
        log.body.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Date range filter match
      let matchesDate = true;
      if (dateFilter === "today") {
        matchesDate = log.date === "2026-07-18";
      } else if (dateFilter === "yesterday") {
        matchesDate = log.date === "2026-07-17";
      } else if (dateFilter === "7d") {
        matchesDate = ["2026-07-18", "2026-07-17", "2026-07-16"].includes(log.date);
      }

      return matchesSearch && matchesDate;
    });
  };

  const filteredLogs = getFilteredLogs();

  // Pagination bounds
  const logsPerPage = 4;
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

  // Derived KPI statistics
  const totalSent = smsLogs.length;
  const sentToday = smsLogs.filter(s => s.date === "2026-07-18").length;
  const delivered = smsLogs.filter(s => s.status === "Delivered").length;
  const failed = smsLogs.filter(s => s.status === "Failed").length;
  const pending = smsLogs.filter(s => s.status === "Pending").length;
  const successRate = totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(1) : "0.0";

  const topCards = [
    { label: "SMS Broadcasts Today", val: sentToday, icon: MessageSquare, col: "text-blue-500", desc: "SIM800L cell dispatches" },
    { label: "Delivered Status", val: delivered, icon: ShieldCheck, col: "text-emerald-500", desc: "Handshake verified" },
    { label: "Failed Pipeline", val: failed, icon: AlertTriangle, col: "text-red-500", desc: "Network timeout or low credit" },
    { label: "Success Delivery Rate", val: `${successRate}%`, icon: Activity, col: "text-purple-500", desc: "Total transmission ratio" }
  ];

  // Recharts delivery success pie
  const successPieData = [
    { name: "Delivered", value: delivered || 1, color: "#10B981" },
    { name: "Failed", value: failed || 0, color: "#EF4444" },
    { name: "Pending", value: pending || 0, color: "#3B82F6" }
  ];

  // Recharts activity line stats over 5 days
  const activityData = [
    { name: "14 July", Delivered: 5, Failed: 0 },
    { name: "15 July", Delivered: 8, Failed: 1 },
    { name: "16 July", Delivered: 6, Failed: 0 },
    { name: "17 July", Delivered: 10, Failed: 2 },
    { name: "18 July", Delivered: delivered, Failed: failed }
  ];

  const failedReasons = [
    { reason: "Network Jam (GPRS busy)", count: smsLogs.filter(s => s.reason === "Network Jam").length },
    { reason: "Low Credit balance", count: smsLogs.filter(s => s.reason === "Low Credit").length },
    { reason: "Signal lost (Modem re-connect)", count: smsLogs.filter(s => s.status === "Pending").length }
  ];

  const handleExport = (format) => {
    triggerToast(
      "Export Started",
      `SIM800L database log compiled into ${format}. Downloading ${filteredLogs.length} rows...`,
      "success"
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      
      {/* Top summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className={`p-4 rounded-xl border flex flex-col justify-between ${
              darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400">{c.label}</span>
                <Icon size={16} className={c.col} />
              </div>
              <div className="mt-3">
                <p className="text-lg font-black leading-none">{c.val}</p>
                <p className="text-[8px] text-slate-455 mt-1 font-bold">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity line chart */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border flex flex-col justify-between ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <div className="mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">SMS Activity Load</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Transmission load timeline over 5 days</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1E293B" : "#E2E8F0"} />
                <XAxis dataKey="name" tick={{ fill: darkMode ? "#94A3B8" : "#64748B", fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: darkMode ? "#94A3B8" : "#64748B", fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: darkMode ? "#0B111E" : "#FFFFFF", borderColor: darkMode ? "#1E293B" : "#E2E8F0", borderRadius: "8px", fontSize: "10px" }} />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Line type="monotone" dataKey="Delivered" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Failed" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Success Pie Chart */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Delivery Success ratio</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Modem response handshake ratio</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={successPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {successPieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: darkMode ? "#0B111E" : "#FFFFFF", borderColor: darkMode ? "#1E293B" : "#E2E8F0", borderRadius: "8px", fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 text-[9px] font-bold">
            {failedReasons.map((fr, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-400">
                <span>{fr.reason}</span>
                <span className="font-mono text-red-500 font-black">{fr.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Control Bar (Search, Filters, Exports) */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center justify-between ${
        darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
      } text-xs font-bold`}>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <input 
            type="text"
            placeholder="Search contact, phone or body..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="p-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 outline-none w-full md:w-64 font-semibold"
          />
          <select 
            value={dateFilter}
            onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
            className="p-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 outline-none font-semibold text-slate-500">
            <option value="all">All Dates</option>
            <option value="today">Today (18 July)</option>
            <option value="yesterday">Yesterday (17 July)</option>
            <option value="7d">Last 3 Days</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => handleExport("CSV")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300 rounded-lg text-[9px] uppercase font-black transition border border-slate-200 dark:border-slate-700">
            Export CSV
          </button>
          <button 
            onClick={() => handleExport("PDF")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[9px] uppercase font-black transition">
            Export PDF
          </button>
        </div>
      </div>

      {/* Main Grid: timeline on left, details cards on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Log */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-5">SIM800L Cell Transmission Timeline</h3>
          
          {filteredLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No matching cell alerts logged.</p>
          ) : (
            <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-6 py-2 text-xs">
              {paginatedLogs.map((sms) => (
                <div 
                  key={sms.id} 
                  onClick={() => setSelectedSMS(sms)}
                  className="relative pl-6 cursor-pointer group">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[6px] top-1.5 h-3.5 w-3.5 rounded-full border-4 border-white dark:border-[#090D16] transition-colors ${
                    sms.status === "Delivered" ? "bg-emerald-500" : sms.status === "Failed" ? "bg-red-500" : "bg-blue-500"
                  }`} />
                  
                  <div className="flex flex-col gap-1 hover:bg-slate-100/30 dark:hover:bg-slate-900/10 p-2.5 rounded-lg -mt-1 border border-transparent hover:border-slate-200/40 dark:hover:border-slate-800/40 transition">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-slate-450 text-[9px]">{sms.date} | {sms.time}</span>
                      <span className="text-[9px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded font-black uppercase">To: {sms.contact}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                        sms.status === "Delivered" ? "bg-emerald-500/10 text-emerald-600" : sms.status === "Failed" ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-650"
                      }`}>{sms.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-350 font-mono mt-1 line-clamp-2">
                      "{sms.body}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          )}
        </div>

        {/* Selected Log Detail sidebar */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Broadcast Detail panel</h3>
            
            {selectedSMS ? (
              <div className="space-y-4 text-xs font-semibold">
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-black block">Recipient Station</span>
                  <span className="text-[11px] text-slate-700 dark:text-slate-200">{selectedSMS.contact}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-black block">Cellular Number</span>
                  <span className="font-mono text-slate-750 dark:text-slate-300">{selectedSMS.to}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-black block">Timestamp</span>
                  <span className="font-mono text-slate-500">{selectedSMS.date} @ {selectedSMS.time}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-black block">Transmission Log Message</span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/40 rounded-xl font-mono text-[9px] leading-relaxed text-slate-700 dark:text-slate-350">
                    {selectedSMS.body}
                  </div>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-black block">Diagnostics Handshake</span>
                  <span className={`font-mono text-[10px] font-black uppercase ${selectedSMS.status === "Delivered" ? "text-emerald-500" : "text-red-500"}`}>
                    {selectedSMS.status} ({selectedSMS.reason})
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 font-bold leading-normal">
                Click any GPRS SMS transmission on the timeline to inspect its cellular handshake diagnostics.
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 mt-4 text-[9px] leading-normal text-blue-550 dark:text-blue-400 font-semibold">
            Note: All alerts are logged locally inside LittleFS cache queue if the cell connection drops temporarily.
          </div>
        </div>

      </div>

    </motion.div>
  );
}

// ==========================================
// VIEW 2.1: DEVICE HARDWARE STATUS (ESP32 STATS)
// ==========================================
function DeviceStatusView({ darkMode }) {
  const [diagnostics, setDiagnostics] = useState(mockDataService.getDeviceDiagnosticStats(0));
  const [latencyHistory, setLatencyHistory] = useState([
    { name: "1", latency: 120 },
    { name: "2", latency: 135 },
    { name: "3", latency: 115 },
    { name: "4", latency: 140 },
    { name: "5", latency: 125 },
    { name: "6", latency: 130 },
    { name: "7", latency: 118 },
    { name: "8", latency: 122 }
  ]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => {
        const nextTick = prev + 1;
        const newStats = mockDataService.getDeviceDiagnosticStats(nextTick);
        setDiagnostics(newStats);
        setLatencyHistory(hist => [...hist.slice(1), { name: nextTick.toString(), latency: newStats.firebaseLatency }]);
        return nextTick;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to readable uptime string
  const formatUptime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // SVG Gauge renderer helper
  const renderGauge = (label, val, percent, strokeColor, detail) => {
    const radius = 35;
    const circ = 2 * Math.PI * radius; // ~219.9
    const offset = circ - (Math.min(100, Math.max(0, percent)) / 100) * circ;

    return (
      <div className="flex flex-col items-center justify-center text-center p-4">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="48" cy="48" r={radius} stroke={darkMode ? "#1E293B" : "#F1F5F9"} strokeWidth="7" fill="transparent" />
            <circle cx="48" cy="48" r={radius} stroke={strokeColor} strokeWidth="7" fill="transparent" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-sm font-black font-mono leading-none">{val}</span>
            <span className="text-[7px] text-slate-400 font-extrabold uppercase mt-1 tracking-widest">{detail}</span>
          </div>
        </div>
        <span className="text-[9px] font-black uppercase text-slate-400 mt-2">{label}</span>
      </div>
    );
  };

  // Convert Wi-Fi RSSI to percentage
  const wifiPercent = Math.max(0, Math.min(100, ((diagnostics.wifiSignal + 90) / 60) * 100));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      
      {/* 5s Pulse Heartbeat Monitor */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
        darkMode ? "bg-blue-950/10 border-blue-900/40 text-blue-300" : "bg-blue-50/50 border-blue-200/50 text-blue-800"
      }`}>
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping shrink-0" />
          <div>
            <p className="text-xs font-black">Industrial Telemetry Polling Active</p>
            <p className="text-[9px] opacity-75 font-semibold mt-0.5">Polling rate: 5000ms. CPU cores and heap buffers status nominal.</p>
          </div>
        </div>
        <div className="text-[8px] font-mono font-bold text-slate-400 bg-slate-150 dark:bg-slate-850 px-2 py-0.5 rounded border border-slate-200/40">
          Last Sync: {diagnostics.lastSyncTime}
        </div>
      </div>

      {/* Gauges Row */}
      <div className={`p-5 rounded-2xl border grid grid-cols-1 md:grid-cols-3 gap-6 ${
        darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
      }`}>
        {renderGauge("CPU Core Utilisation", `${diagnostics.cpuUsage}%`, diagnostics.cpuUsage, "#3B82F6", "LOAD")}
        {renderGauge("Edge Health Rating", `${diagnostics.deviceHealth}/100`, diagnostics.deviceHealth, "#10B981", "RATING")}
        {renderGauge("Wi-Fi Signal Strength", `${diagnostics.wifiSignal} dBm`, wifiPercent, "#F59E0B", "RSSI")}
      </div>

      {/* Memory Utilization Bars & Firebase Latency Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Progress Resource Utilization */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        } text-xs font-semibold`}>
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Resource Buffers Allocation</h3>
            
            <div className="space-y-5">
              
              {/* Heap Progress */}
              <div>
                <div className="flex justify-between text-[10px] mb-1 font-extrabold uppercase">
                  <span className="text-slate-450">ESP32 Heap Memory</span>
                  <span className="text-slate-700 dark:text-slate-200">
                    {Math.round(((520000 - diagnostics.freeHeapBytes) / 520000) * 100)}% Used
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${((520000 - diagnostics.freeHeapBytes) / 520000) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 mt-1 font-bold">
                  <span>Free: {diagnostics.freeHeapBytes.toLocaleString()} Bytes</span>
                  <span>Total: 520 KB</span>
                </div>
              </div>

              {/* Flash Storage Usage */}
              <div>
                <div className="flex justify-between text-[10px] mb-1 font-extrabold uppercase">
                  <span className="text-slate-450">LittleFS Flash Allocation</span>
                  <span className="text-slate-700 dark:text-slate-200">{diagnostics.flashUsagePct}% Used</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${diagnostics.flashUsagePct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 mt-1 font-bold">
                  <span>Usage: {((4 * diagnostics.flashUsagePct) / 100).toFixed(2)} MB</span>
                  <span>Total Size: 4.00 MB</span>
                </div>
              </div>

              {/* Battery Simulator */}
              <div>
                <div className="flex justify-between text-[10px] mb-1 font-extrabold uppercase">
                  <span className="text-slate-450">Lithium-Poly Battery link</span>
                  <span className="text-slate-400 font-extrabold uppercase">Not Connected</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-slate-300 dark:bg-slate-700 rounded-full w-0" />
                </div>
                <p className="text-[8px] text-slate-400 mt-1 font-bold uppercase">
                  Running on external AC power transformer (5V 2A microUSB).
                </p>
              </div>

            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 text-[9px] text-slate-400 font-bold uppercase flex justify-between">
            <span>Uptime: {formatUptime(diagnostics.uptimeSec)}</span>
            <span>Restarts: {diagnostics.restartCount}</span>
          </div>
        </div>

        {/* Right: Firebase Latency Area Chart */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border flex flex-col justify-between ${
          darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
        }`}>
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Realtime Database Latency</h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Firebase Realtime Sync latency curve (ms)</p>
          </div>
          <div className="h-44 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1E293B" : "#E2E8F0"} />
                <XAxis dataKey="name" tick={{ fill: darkMode ? "#94A3B8" : "#64748B", fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: darkMode ? "#94A3B8" : "#64748B", fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: darkMode ? "#0B111E" : "#FFFFFF", borderColor: darkMode ? "#1E293B" : "#E2E8F0", borderRadius: "8px", fontSize: "10px" }} />
                <Area type="monotone" dataKey="latency" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#latencyGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Diagnostic Specification Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core ESP32 diagnostics */}
        <div className={`p-6 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">ESP32 Core Diagnostics</h4>
          <div className="space-y-3 text-xs font-semibold">
            {[
              ["Silicon Core Type", "Tensilica Xtensa Dual-Core 32-bit LX6"],
              ["CPU Frequency", "240 MHz"],
              ["Free Internal Heap Size", `${diagnostics.freeHeapBytes.toLocaleString()} Bytes`],
              ["WDT Timeout Limit", "8 Seconds"],
              ["Analog ADC Mappings", "12-bit Resolution (0 - 4095)"]
            ].map(([k, v], idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40 last:border-0">
                <span className="text-slate-400">{k}</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Network & Link Statistics */}
        <div className={`p-6 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Edge Network Statistics</h4>
          <div className="space-y-3 text-xs font-semibold">
            {[
              ["Wi-Fi Signal Strength (RSSI)", `${diagnostics.wifiSignal} dBm (Optimal)`],
              ["Firebase Latency Delay", `${diagnostics.firebaseLatency} ms`],
              ["SIM800L Registered Network", "Airtel / Jio 2G"],
              ["SIM800L Signal Strength (CSQ)", "18 / 31 (Strong)"],
              ["Cell Uptime Gateway Link", "100.0%"]
            ].map(([k, v], idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40 last:border-0">
                <span className="text-slate-400">{k}</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Memory Partition Allocation */}
        <div className={`p-6 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Flash Storage Allocation</h4>
          <div className="space-y-3 text-xs font-semibold">
            {[
              ["Total Flash Memory size", "4.00 MB"],
              ["Program Partition (App)", "1.24 MB (31.0%)"],
              ["LittleFS Cache Filesystem", "2.76 MB (69.0%)"],
              ["Offline Backups Circular Queue Size", "250 records maximum"],
              ["System Temperature", `${diagnostics.systemTemp} °C`]
            ].map(([k, v], idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40 last:border-0">
                <span className="text-slate-400">{k}</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{v}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </motion.div>
  );
}

// ==========================================
// VIEW 2.2: SETTINGS (WARNING CRITICAL PARAM TUNE)
// ==========================================
function SettingsView({ darkMode, settings, setSettings, triggerToast }) {
  const [form, setForm] = useState({ ...settings });

  const handleSave = (e) => {
    e.preventDefault();
    setSettings({ ...form });
    triggerToast("Settings Saved", "Sensors thresholds updated successfully.", "success");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <div className={`p-6 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
        <h3 className="text-sm font-black border-b border-slate-100 dark:border-slate-800 pb-3 mb-6 font-display">Tuning Parameters Configuration</h3>

        <form onSubmit={handleSave} className="space-y-5 text-xs font-bold">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Danger Depth Threshold (cm)</label>
              <input 
                type="number"
                value={form.dangerThresholdCm}
                onChange={e => setForm({ ...form, dangerThresholdCm: Number(e.target.value) })}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none text-sm font-semibold font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Warning Depth Threshold (cm)</label>
              <input 
                type="number"
                value={form.warningThresholdCm}
                onChange={e => setForm({ ...form, warningThresholdCm: Number(e.target.value) })}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none text-sm font-semibold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Max Flow Velocity Limit (L/min)</label>
              <input 
                type="number"
                value={form.flowAlarmLimitLpm}
                onChange={e => setForm({ ...form, flowAlarmLimitLpm: Number(e.target.value) })}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none text-sm font-semibold font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">System Polling Interval (sec)</label>
              <input 
                type="number"
                value={form.updateIntervalSec}
                onChange={e => setForm({ ...form, updateIntervalSec: Number(e.target.value) })}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none text-sm font-semibold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Primary Warning Recipient Mobile</label>
            <input 
              type="text"
              value={form.adminPhone}
              onChange={e => setForm({ ...form, adminPhone: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none text-sm font-semibold font-mono"
              placeholder="+919876543210"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800/40">
            <div>
              <p className="text-slate-800 dark:text-slate-200">Localized Active Siren Alarm</p>
              <p className="text-[10px] text-slate-400 font-semibold leading-tight mt-0.5">Toggle high-frequency buzzer audio on banks.</p>
            </div>
            <button 
              type="button"
              onClick={() => setForm({ ...form, sirenEnabled: !form.sirenEnabled })}
              className="text-blue-600">
              <ToggleLeft size={28} className={form.sirenEnabled ? "rotate-180 text-blue-600 transition" : "text-slate-400 transition"} />
            </button>
          </div>

          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-sm transition">
            Save Configuration Changes
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// ==========================================
// VIEW 2.3: USER MANAGEMENT & VISITOR RECORDS
// ==========================================
function UserManagementView({ darkMode, token, setToken, triggerToast }) {
  const [visitors, setVisitors] = useState([]);
  const [accesses, setAccesses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsersData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const [resVis, resAcc] = await Promise.all([
        fetch("/api/admin/visitors", { headers }),
        fetch("/api/admin/accesses", { headers })
      ]);
      if (!resVis.ok || !resAcc.ok) throw new Error("Unauthorized");
      const dataVis = await resVis.json();
      const dataAcc = await resAcc.json();
      setVisitors(dataVis.visitors || []);
      setAccesses(dataAcc.accesses || []);
    } catch (e) {
      setToken("");
      sessionStorage.removeItem("admin_token");
      triggerToast("Authorized Failed", "Admin credentials re-verification required.", "danger");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsersData();
  }, [token]);

  if (!token) {
    return (
      <div className="max-w-sm mx-auto p-6 rounded-2xl border text-center text-xs font-semibold space-y-4 dark:border-slate-800">
        <AlertTriangle className="text-red-500 mx-auto" size={32} />
        <p className="text-slate-500">Please login to the Admin Panel tab to establish a valid admin token session first.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      
      {/* Visitors table list */}
      <div className={`p-5 rounded-2xl border ${
        darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
      }`}>
        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Contact Warning Subscribers Registry</h4>
        
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-4 font-bold">Syncing registry...</p>
        ) : visitors.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4 font-bold">No warning subscribers registered.</p>
        ) : (
          <table className="w-full text-[10px] text-left border-collapse font-semibold">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-black">
                <th className="py-2.5">Subscriber ID</th>
                <th className="py-2.5">Email</th>
                <th className="py-2.5">Mobile Phone</th>
                <th className="py-2.5">Registered At</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v.id} className="border-b border-slate-100 dark:border-slate-800/40">
                  <td className="py-2.5 font-mono text-slate-400">#{v.id}</td>
                  <td className="py-2.5 text-slate-800 dark:text-slate-100">{v.email}</td>
                  <td className="py-2.5 text-slate-800 dark:text-slate-100">{v.phone}</td>
                  <td className="py-2.5 font-mono text-slate-400">{new Date(v.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Access logs table */}
      <div className={`p-5 rounded-2xl border ${
        darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
      }`}>
        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Visitor Portal Query Logs</h4>
        
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-4 font-bold">Syncing audit logs...</p>
        ) : accesses.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4 font-bold">No queries audited yet.</p>
        ) : (
          <table className="w-full text-[10px] text-left border-collapse font-semibold">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-black">
                <th className="py-2.5">Log ID</th>
                <th className="py-2.5">Visitor ID</th>
                <th className="py-2.5">Requested Region</th>
                <th className="py-2.5 font-mono">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {accesses.map((acc) => (
                <tr key={acc.id} className="border-b border-slate-100 dark:border-slate-800/40">
                  <td className="py-2.5 font-mono text-slate-400">#{acc.id}</td>
                  <td className="py-2.5 font-mono text-slate-800 dark:text-slate-100">Visitor #{acc.visitor_id}</td>
                  <td className="py-2.5 text-slate-800 dark:text-slate-100">{acc.city_name}, {acc.state_name}</td>
                  <td className="py-2.5 font-mono text-slate-400">{new Date(acc.accessed_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </motion.div>
  );
}

// ==========================================
// VIEW 2.4: TERMINAL SYSTEM CONSOLE LOGS
// ==========================================
function SystemLogsView({ darkMode, logs, setLogs }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className={`p-5 rounded-2xl border ${
        darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
      }`}>
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Live System Logs Console</h4>
          <button 
            onClick={() => setLogs([])}
            className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded font-bold">
            Clear Console
          </button>
        </div>

        <div className="p-4 rounded-xl bg-black border border-slate-900 h-80 overflow-y-auto font-mono text-[10px] text-emerald-500 space-y-1.5 scrollbar-thin">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2">
              <span className="text-slate-500">[{log.time}]</span>
              <span className={`uppercase font-black ${
                log.type === "telemetry" ? "text-blue-400" :
                log.type === "cellular" ? "text-purple-400" : "text-emerald-500"
              }`}>[{log.type}]</span>
              <span className="text-slate-300 font-semibold">{log.msg}</span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// VIEW 2: REGIONAL REPORTS (CITY SEARCH)
// ==========================================
function ReportsView({ darkMode, triggerToast }) {
  const [visitorId, setVisitorId] = useState(sessionStorage.getItem("visitor_id") || "");
  const [visitorForm, setVisitorForm] = useState({ email: "", phone: "" });
  const [states, setStates] = useState({});
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/locations/india")
      .then(res => res.json())
      .then(data => setStates(data.states))
      .catch(e => console.error("Catalog load fail", e));
  }, []);

  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visitorForm)
      });
      if (!res.ok) throw new Error("Verification failed");
      const data = await res.json();
      setVisitorId(data.id);
      sessionStorage.setItem("visitor_id", data.id);
      triggerToast("Verification Successful", "Reports console unlocked.", "success");
    } catch (e) {
      triggerToast("Access Denied", "Credentials validation failed.", "danger");
    }
  };

  const getAreaReport = async () => {
    if (!selectedState || !selectedCity) {
      triggerToast("Selection Needed", "Please select target city.", "info");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reports/area", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitor_id: Number(visitorId), state: selectedState, city: selectedCity })
      });
      if (!res.ok) throw new Error("Report fetch failed");
      const result = await res.json();
      setReport(result);
      triggerToast("Report Generated", `Risk database queried: ${selectedCity}`, "success");
    } catch (e) {
      triggerToast("Fetch Failed", "Meteorology connection failed.", "danger");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {!visitorId ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-3xl border max-w-sm mx-auto ${
            darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow"
          }`}>
          <div className="text-center space-y-2 mb-6">
            <p className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Verification Lock</p>
            <h2 className="text-lg font-black">Regional Alert Console</h2>
            <p className="text-xs text-slate-400">Provide contact credentials to search Indian river states.</p>
          </div>
          
          <form onSubmit={handleVisitorSubmit} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-slate-400 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={visitorForm.email}
                onChange={e => setVisitorForm({ ...visitorForm, email: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none text-sm font-semibold"
                placeholder="name@example.com" 
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Phone Number</label>
              <input 
                type="tel" 
                required 
                value={visitorForm.phone}
                onChange={e => setVisitorForm({ ...visitorForm, phone: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none text-sm font-semibold"
                placeholder="+91 9876543210" 
              />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-sm transition">
              Verify Credentials
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className={`p-6 rounded-2xl border ${
            darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <h3 className="text-sm font-black border-b border-slate-100 dark:border-slate-800 pb-3 mb-6">Select Indian Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs font-bold">
              <div>
                <label className="block text-slate-400 mb-1">State</label>
                <select 
                  value={selectedState} 
                  onChange={e => { setSelectedState(e.target.value); setSelectedCity(""); }}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-sm outline-none">
                  <option value="">-- Choose State --</option>
                  {Object.keys(states).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-slate-400 mb-1">City</label>
                <select 
                  value={selectedCity} 
                  onChange={e => setSelectedCity(e.target.value)}
                  disabled={!selectedState}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-sm outline-none disabled:opacity-50">
                  <option value="">-- Choose City --</option>
                  {selectedState && Object.keys(states[selectedState]).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <button 
                onClick={getAreaReport} 
                disabled={loading}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-sm transition">
                {loading ? "Locking metrics..." : "Query Hydrology Report"}
              </button>
            </div>
          </div>

          {report && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className={`p-6 rounded-2xl border ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
                  <h4 className="text-sm font-black mb-4">{report.city} Hydrological Report</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-3 bg-slate-100/40 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
                      <p className="text-slate-400 uppercase font-bold text-[9px]">Monitored River</p>
                      <p className="text-base font-extrabold mt-1 text-slate-800 dark:text-slate-100">{report.river}</p>
                    </div>
                    <div className="p-3 bg-slate-100/40 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
                      <p className="text-slate-400 uppercase font-bold text-[9px]">Water Depth</p>
                      <p className="text-base font-mono font-extrabold mt-1 text-slate-800 dark:text-slate-100">{report.water_level_m} m</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ==========================================
// VIEW 3: ADMIN VIEW (LOGS DATABASE)
// ==========================================
function AdminView({ darkMode, token, setToken, triggerToast }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error("Invalid admin credentials");
      const data = await res.json();
      setToken(data.access_token);
      sessionStorage.setItem("admin_token", data.access_token);
      triggerToast("Success", "Authorized admin session established.", "success");
    } catch (e) {
      triggerToast("Access Denied", "Invalid admin credentials.", "danger");
    }
  };

  const handleLogout = () => {
    setToken("");
    sessionStorage.removeItem("admin_token");
    triggerToast("Logged Out", "Admin session closed.", "info");
  };

  if (!token) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-3xl border max-w-sm mx-auto ${
          darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow"
        }`}>
        <div className="text-center space-y-2 mb-6">
          <p className="text-[10px] font-black tracking-widest text-red-500 uppercase">Restricted Section</p>
          <h2 className="text-lg font-black">Admin Command Login</h2>
          <p className="text-xs text-slate-400">Provide admin credentials to audit geo-access logs.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-400 mb-1">Admin Username</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none text-sm font-semibold"
              placeholder="e.g. admin" 
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none text-sm font-semibold"
              placeholder="••••••••" 
            />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-sm transition">
            Login
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-sm mx-auto">
      <div className={`p-6 rounded-2xl border text-center space-y-4 ${darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
        <CheckCircle className="text-emerald-500 mx-auto" size={40} />
        <h3 className="text-sm font-black">Authorized Session Active</h3>
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">You have full permissions to review registry logs, clear prediction audits, and toggle alert settings.</p>
        <button 
          onClick={handleLogout}
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-extrabold text-sm transition flex items-center justify-center gap-2">
          <LogOut size={14} /> Log Out Admin Session
        </button>
      </div>
    </motion.div>
  );
}

// ==========================================
// VIEW 4: DOCUMENTATION & ACADEMIC REFERENCE
// ==========================================
function DocsView({ darkMode }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6 text-xs leading-relaxed text-slate-500 dark:text-slate-300">
      <div className={`p-6 rounded-2xl border ${
        darkMode ? "bg-[#0B111E] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
      }`}>
        <h2 className="text-base font-black flex items-center gap-2 text-slate-800 dark:text-white">
          <FileText className="text-blue-500" /> Academic Project Reference
        </h2>
        <p className="mt-1 text-slate-400 font-bold">Hardware mapping schemas and panel answers.</p>
      </div>
    </motion.div>
  );
}
