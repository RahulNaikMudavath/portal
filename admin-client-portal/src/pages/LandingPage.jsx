import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  HardHat,
  Compass,
  CheckCircle2,
  FileCheck2,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Sparkles,
  Sliders,
  Layers,
  MessageSquare,
  Check,
  X,
  Send,
  Landmark,
  FileSpreadsheet
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  // Authentication check for logged in user quick access
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const token = localStorage.getItem("token");
      if (user && token) {
        setCurrentUser(user);
      }
    } catch {
      // ignore parsing error
    }
  }, []);

  // Interactive Live Showcase Active Tab
  const [activeTab, setActiveTab] = useState("whatsapp");

  // Interactive Before/After Slider State
  const [sliderPosition, setSliderPosition] = useState(50);

  // Interactive Project Cost Estimator State
  const [projectType, setProjectType] = useState("residential"); // residential, commercial, duplex, approval
  const [builtArea, setBuiltArea] = useState(1800); // sq ft
  const [qualityGrade, setQualityGrade] = useState("premium"); // standard, premium, luxury

  // Consultation Modal State
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultForm, setConsultForm] = useState({
    name: "",
    phone: "",
    city: "Guntur",
    service: "House Planning & 3D Elevation",
    plotSize: "30x40 (1200 Sq Ft)",
    message: ""
  });
  const [consultSuccess, setConsultSuccess] = useState(false);

  // Dynamic cost calculations
  const calculateEstimate = () => {
    let ratePerSqFt = 1950;
    if (projectType === "commercial") ratePerSqFt = 2300;
    if (projectType === "duplex") ratePerSqFt = 2450;
    if (projectType === "approval") return { min: 25000, max: 65000, isFlat: true };

    if (qualityGrade === "standard") ratePerSqFt *= 0.88;
    if (qualityGrade === "luxury") ratePerSqFt *= 1.35;

    const baseCost = builtArea * ratePerSqFt;
    const cementBags = Math.round(builtArea * 0.42);
    const steelTonnes = (builtArea * 0.0038).toFixed(1);
    const durationMonths = Math.max(4, Math.round(builtArea / 350));

    return {
      minCost: Math.round(baseCost * 0.95),
      maxCost: Math.round(baseCost * 1.08),
      cementBags,
      steelTonnes,
      durationMonths,
      ratePerSqFt: Math.round(ratePerSqFt)
    };
  };

  const estimate = calculateEstimate();

  const handleSendWhatsAppConsultation = (e) => {
    e.preventDefault();
    if (!consultForm.name || !consultForm.phone) {
      alert("Please fill in your name and phone number.");
      return;
    }

    const text = encodeURIComponent(
      `Hello Er. Ramesh Naik garu (MAARAN Engineers),\n\nI would like to request an engineering consultation:\n` +
      `👤 Name: ${consultForm.name}\n` +
      `📞 Phone: ${consultForm.phone}\n` +
      `📍 Location: ${consultForm.city}\n` +
      `🛠️ Service: ${consultForm.service}\n` +
      `📐 Plot Size/Area: ${consultForm.plotSize}\n` +
      (consultForm.message ? `📝 Details: ${consultForm.message}\n` : "") +
      `\nPlease let me know the process for site visit / plan preparation.`
    );

    window.open(`https://wa.me/919533956730?text=${text}`, "_blank");
    setConsultSuccess(true);
    setTimeout(() => {
      setConsultSuccess(false);
      setShowConsultModal(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans relative overflow-x-hidden">
      
      {/* Background Architectural Blueprint Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-35" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-10 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* TOP FLOATING NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Lead Engineer Credentials */}
          <Link to="/" className="flex items-center gap-3.5 group cursor-pointer">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition duration-200">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-white">MAARAN</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 font-bold text-amber-400 uppercase tracking-wider">
                  Govt Approved
                </span>
              </div>
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">
                Engineers & Consultancy • APCRDA Licensed
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#services" className="hover:text-amber-400 transition">Services</a>
            <a href="#erp-features" className="hover:text-indigo-400 transition">ConstructAI ERP</a>
            <a href="#approvals" className="hover:text-emerald-400 transition">Municipal Approvals</a>
            <a href="#estimator" className="hover:text-amber-400 transition">Cost Estimator</a>
            <a href="#offices" className="hover:text-slate-100 transition">Offices</a>
          </nav>

          {/* Right Actions & Portal CTA */}
          <div className="flex items-center gap-3">
            
            {/* Direct WhatsApp Callout */}
            <a
              href="https://wa.me/919533956730?text=Hello%20Er.%20Ramesh%20Naik%20garu,%20I%20visited%20your%20website%20and%20need%20civil%20engineering%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800/80 hover:bg-emerald-900/60 text-emerald-400 font-bold text-xs transition duration-150"
            >
              <MessageSquare className="h-4 w-4" />
              <span>+91 9533956730</span>
            </a>

            {currentUser ? (
              <button
                onClick={() => navigate(currentUser.role === "admin" ? "/admin/work-inbox" : "/client/dashboard")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition cursor-pointer"
              >
                <span>Workspace ({currentUser.name?.split(" ")[0] || "Portal"})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition"
                >
                  <span>Launch Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Lead Engineer & Government Accreditation Pill */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner backdrop-blur-md"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-200">
                Er. M. Ramesh Naik, <span className="text-indigo-400">M.Tech (Civil)</span>
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[11px] font-semibold text-amber-400">
                APCRDA, GMC & VMC Licensed Structural Engineer
              </span>
            </motion.div>

            {/* Main Punchy Slogan & Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-3"
            >
              <p className="text-sm md:text-base font-extrabold uppercase tracking-widest text-amber-400">
                “We Design Your Dream World”
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15]">
                Civil Engineering Mastery Meets{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-amber-300 to-indigo-300">
                  Intelligent Real-Time ERP
                </span>
              </h1>
            </motion.div>

            {/* Comprehensive Telugu & English Core Value Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm md:text-base text-slate-400 max-w-3xl mx-auto leading-relaxed"
            >
              Turnkey 100% Vaastu-compliant house plans, 3D photorealistic elevations, advanced structural calculations, soil testing, and bank valuations. Integrated with <strong>ConstructAI ERP</strong> for automated WhatsApp dispatch, GPS field check-ins, and doorstep municipal sanctions (APCRDA / GMC / VMC / BPS).
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-2"
            >
              <Link
                to="/login"
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-amber-600 hover:from-indigo-500 hover:to-amber-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-indigo-600/20 active:scale-95 transition flex items-center gap-3 cursor-pointer"
              >
                <HardHat className="h-5 w-5" />
                <span>Enter ConstructAI Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={() => setShowConsultModal(true)}
                className="px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 text-slate-200 border border-slate-700/80 font-bold text-sm transition flex items-center gap-2.5 active:scale-95 cursor-pointer"
              >
                <FileCheck2 className="h-5 w-5 text-amber-400" />
                <span>Book Free Site Consultation</span>
              </button>
            </motion.div>

            {/* Trust & Live Project Milestones Metric Strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 text-left"
            >
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <p className="text-2xl md:text-3xl font-black text-white">500+</p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Approved House & Building Plans</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <p className="text-2xl md:text-3xl font-black text-amber-400">₹250Cr+</p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Bank Valuations & Project BOQs</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <p className="text-2xl md:text-3xl font-black text-emerald-400">100%</p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Vaastu & Structural Compliance</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <p className="text-2xl md:text-3xl font-black text-indigo-400">Doorstep</p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Service & Municipal Sanction</p>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* MUNICIPAL & REGULATORY APPROVAL AUTHORITY STRIP */}
      <section id="approvals" className="py-12 bg-slate-900/40 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">
              Authorized Licensing & Regulatory Compliance
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Official Government Sanctioned Engineering
            </h2>
            <p className="text-xs text-slate-400">
              Approved authority for building permissions, BPS regularizations, and banking certifications across Andhra Pradesh.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex flex-col items-center text-center justify-center space-y-2 hover:border-indigo-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black text-sm">
                APCRDA
              </div>
              <div>
                <p className="text-xs font-bold text-white">APCRDA Approved</p>
                <p className="text-[9px] text-slate-400">Capital Region Authority</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex flex-col items-center text-center justify-center space-y-2 hover:border-emerald-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-sm">
                GMC
              </div>
              <div>
                <p className="text-xs font-bold text-white">GMC Licensed</p>
                <p className="text-[9px] text-slate-400">Guntur Municipal Corp</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex flex-col items-center text-center justify-center space-y-2 hover:border-indigo-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-sm">
                VMC
              </div>
              <div>
                <p className="text-xs font-bold text-white">VMC Licensed</p>
                <p className="text-[9px] text-slate-400">Vinukonda Municipal Council</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex flex-col items-center text-center justify-center space-y-2 hover:border-amber-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black text-sm">
                BPS
              </div>
              <div>
                <p className="text-xs font-bold text-white">BPS Clearance</p>
                <p className="text-[9px] text-slate-400">Penalisation Scheme Works</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex flex-col items-center text-center justify-center space-y-2 hover:border-blue-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-sm">
                F.I.I.V
              </div>
              <div>
                <p className="text-xs font-bold text-white">Approved Valuer</p>
                <p className="text-[9px] text-slate-400">Banks & NBFC Valuations</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex flex-col items-center text-center justify-center space-y-2 hover:border-purple-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-sm">
                A.M.I.E
              </div>
              <div>
                <p className="text-xs font-bold text-white">Chartered Engineer</p>
                <p className="text-[9px] text-slate-400">Institution of Engineers (India)</p>
              </div>
            </div>

          </div>

          {/* Doorstep Service Guarantee Telugu Callout */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-amber-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="text-2xl">🚪</span>
              <div>
                <p className="text-xs font-bold text-white">
                  SERVICE @ YOUR DOORSTEPS • మీ ప్లాన్స్ లేక మున్సిపల్ అప్రూవల్స్ కోసం మా దగ్గరికి రావాల్సిన పని లేదు!
                </p>
                <p className="text-[11px] text-slate-400">
                  Just one phone call or WhatsApp, and our engineering team visits your site, creates plans, gets online approvals, and delivers your sanctioned file home.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowConsultModal(true)}
              className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Request Doorstep Visit
            </button>
          </div>

        </div>
      </section>

      {/* COMPREHENSIVE CIVIL ENGINEERING SERVICES (BENTO GRID) */}
      <section id="services" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-black uppercase text-indigo-400 tracking-widest">
              Core Engineering Expertise
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              End-to-End Architectural, Structural & Valuation Services
            </h2>
            <p className="text-sm text-slate-400">
              Decades of civil engineering excellence with complete AutoCAD design, geotechnical investigation, and execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. House Plans & 100% Vaastu */}
            <div className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition duration-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Compass className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">100% Vaastu House Plans & 3D Elevations</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Custom 2D floor plans and 3D photorealistic exterior elevations matching perfect Vaastu Shastra principles for residential villas, apartments, and duplexes.
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Independent Houses, Villas & Duplexes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Commercial Complexes & Layout Plots</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>3D Architectural Renders & Walkthroughs</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setConsultForm(prev => ({ ...prev, service: "House Plans & 3D Elevation" }));
                  setShowConsultModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs transition text-center cursor-pointer"
              >
                Inquire for House Plan
              </button>
            </div>

            {/* 2. Structural Design & Complex Structures */}
            <div className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition duration-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Layers className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">Structural Engineering & Multi-Storey Frameworks</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Safe RCC and steel structure calculations conforming to IS 456 standards. Designing schools, colleges, hospitals, malls, and industrial godowns.
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Schools, Function Halls & Multiplexes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Industrial Godowns & Pipelines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Cluster Housing & Temple Architecture</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setConsultForm(prev => ({ ...prev, service: "Structural Design & Calculations" }));
                  setShowConsultModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs transition text-center cursor-pointer"
              >
                Inquire for Structural Design
              </button>
            </div>

            {/* 3. Soil Testing & Bank Valuation */}
            <div className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition duration-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Landmark className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">Soil Testing, Surveys & Bank Valuations</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Certified chartered valuer for nationalized banks & NBFCs for home loans and property valuations. Land surveys with Total Station & soil bearing analysis.
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Bank Mortgage & Loan Valuation Reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Total Station Land Surveying & Marking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Geotechnical Soil Bearing Capacity Tests</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setConsultForm(prev => ({ ...prev, service: "Bank Valuation / Soil Testing" }));
                  setShowConsultModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs transition text-center cursor-pointer"
              >
                Inquire for Valuation & Soil Test
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* INTERACTIVE CONSTRUCTAI ERP LIVE SHOWCASE (TABBED INTERACTIVE PREVIEW) */}
      <section id="erp-features" className="py-20 bg-slate-900/40 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-black uppercase text-amber-400 tracking-widest">
              ConstructAI ERP Technology
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Explore the Smart Construction Management Engine
            </h2>
            <p className="text-sm text-slate-400">
              Click through the interactive modules below to preview how our ERP coordinates clients, site engineers, and administrative oversight in real-time.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveTab("whatsapp")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "whatsapp"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>📱 WhatsApp AI Work Dispatch</span>
            </button>

            <button
              onClick={() => setActiveTab("gps")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "gps"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>📍 GPS Field Check-Ins</span>
            </button>

            <button
              onClick={() => setActiveTab("slider")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "slider"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>🔀 Before/After Site Slider</span>
            </button>

            <button
              onClick={() => setActiveTab("boq")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "boq"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>💰 1-Click BOQ Quotations</span>
            </button>
          </div>

          {/* Interactive Showcase Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            
            {/* 1. WHATSAPP AI WORK DISPATCH PREVIEW */}
            {activeTab === "whatsapp" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    <span>Meta Cloud API v23.0 Connected</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Client Messaging Automatically Becomes Executable Site Tasks
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    When a client or developer texts photos, voice notes, or inspection requirements to MAARAN’s WhatsApp line (+91 9533956730), ConstructAI extracts the task, calculates material costs, and dispatches the nearest field engineer with GPS instructions.
                  </p>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Audio Waveform Voice Note Playback (1x, 1.5x, 2x)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>1-Click Canned Quotation Dispatch to Client</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Automated Cloudinary PDF & CAD Drawing Storage</span>
                    </div>
                  </div>
                </div>

                {/* Simulated WhatsApp UI Frame */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 font-sans">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                        RN
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Kalyan Chakravarthi (Arundelpet Project)</p>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                          Online • WhatsApp Verified
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                      Site ID: MAA-9821
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs py-2">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-none max-w-[85%] text-slate-300">
                      <p className="font-semibold text-amber-400 text-[11px]">Client Inquiry:</p>
                      <p>Er. Ramesh garu, please verify the 2nd floor column reinforcement alignment before tomorrow morning's slab pouring.</p>
                      <span className="text-[9px] text-slate-500 float-right mt-1">10:42 AM</span>
                    </div>

                    <div className="bg-indigo-950/80 border border-indigo-800/80 p-3 rounded-2xl rounded-tr-none max-w-[85%] ml-auto text-slate-200">
                      <p className="font-semibold text-indigo-400 text-[11px]">⚡ ConstructAI Auto-Dispatch:</p>
                      <p>Field Engineer assigned: Er. Maaran. GPS site check-in scheduled for 2:30 PM today with structural checklist #IS456.</p>
                      <span className="text-[9px] text-indigo-400 float-right mt-1">10:43 AM ✓✓</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="Type a message or trigger 1-Click BOQ dispatch..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500"
                    />
                    <button className="px-3 py-2 bg-emerald-600 rounded-xl text-white font-bold text-xs flex items-center gap-1">
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. GPS FIELD CHECK-IN PREVIEW */}
            {activeTab === "gps" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                    <span>Geofenced Site Verification</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Live Engineer Tracking & Timestamped Quality Inspections
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Engineers verify their physical presence on construction sites using high-precision GPS geofencing. Inspection photos and structural checklists cannot be submitted unless verified inside the geofence perimeter.
                  </p>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Site:</span>
                      <span className="text-white font-bold">Arundelpet Commercial Complex</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coordinates:</span>
                      <span className="text-amber-400 font-mono">16.3067° N, 80.4365° E</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Check-in Status:</span>
                      <span className="text-emerald-400 font-bold">Verified On-Site 📍</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="h-48 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                    
                    {/* Geofence Ring */}
                    <div className="w-32 h-32 rounded-full border-2 border-indigo-500/40 bg-indigo-500/10 animate-ping absolute" />
                    <div className="w-24 h-24 rounded-full border border-indigo-400 bg-indigo-600/20 flex items-center justify-center relative z-10 shadow-lg">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                        📍
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                      Geofence Radius: 50m • Accuracy: ±2.4m
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Structural Checklist Compliance</span>
                      <span className="text-emerald-400 font-bold">8 / 8 Checked (100%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. BEFORE / AFTER SITE SLIDER */}
            {activeTab === "slider" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                    <span>Visual Progress Telemetry</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Interactive Before vs After Structural Progression
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Drag the interactive split handle on the right to compare foundation and brickwork stages with final architectural 3D elevations and finished buildings.
                  </p>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                    <p className="font-bold text-slate-200">Featured Project:</p>
                    <p className="text-amber-400">Luxury Residential Villa • Brodipet 4/1, Guntur</p>
                    <p className="text-slate-400 text-[11px]">Execution Time: 7 Months • Value: ₹1.45 Cr</p>
                  </div>
                </div>

                {/* Draggable Before / After Split Slider */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="relative h-64 rounded-xl overflow-hidden border border-slate-800 select-none">
                    
                    {/* After Image Layer (Background) */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-amber-950 flex flex-col items-center justify-center text-center p-6">
                      <Building2 className="h-16 w-16 text-amber-400 mb-2 opacity-80" />
                      <span className="text-base font-black text-white">COMPLETED ARCHITECTURAL ELEVATION</span>
                      <p className="text-[11px] text-amber-300">100% Vaastu Compliant • Exterior Lighting & Finish</p>
                      <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold uppercase">
                        After
                      </span>
                    </div>

                    {/* Before Image Layer (Clipped Overlay) */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center text-center p-6 border-r-2 border-amber-400"
                      style={{ width: `${sliderPosition}%`, overflow: "hidden" }}
                    >
                      <HardHat className="h-16 w-16 text-indigo-400 mb-2 opacity-80" />
                      <span className="text-base font-black text-white whitespace-nowrap">FOUNDATION & RCC FRAMEWORK</span>
                      <p className="text-[11px] text-slate-400 whitespace-nowrap">Soil Testing • Structural Pillar Alignment</p>
                      <span className="absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                        Before
                      </span>
                    </div>

                    {/* Split Line Indicator */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-amber-400 cursor-ew-resize flex items-center justify-center"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shadow-lg">
                        ↔
                      </div>
                    </div>

                  </div>

                  {/* Range Slider Control */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>◀ Excavation / Frame (0%)</span>
                      <span>Drag to Compare ({sliderPosition}%)</span>
                      <span>Finished Elevation (100%) ▶</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. 1-CLICK BOQ QUOTATION GENERATOR */}
            {activeTab === "boq" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    <span>Commercial Precision</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Automated Bill of Quantities & Material Cost Forecasting
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Instantly calculate cement bags, TMT steel tonnage, labor rates, and GST breakdown for any project size. Export printable PDF letterheads for MAARAN Engineers with 1 click.
                  </p>
                  <button
                    onClick={() => {
                      const el = document.getElementById("estimator");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Try Interactive Cost Estimator Below ↓
                  </button>
                </div>

                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white">MAARAN BOQ Sample Letterhead</span>
                    <span className="text-[10px] text-amber-400 font-mono">₹ Indian Rupee Format</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-850">
                      <span>Cement (UltraTech 53 Grade - 756 Bags)</span>
                      <span className="font-bold text-slate-200">₹2,94,840</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-850">
                      <span>TMT Steel Fe550D (6.8 Metric Tonnes)</span>
                      <span className="font-bold text-slate-200">₹4,42,000</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-850">
                      <span>Labor & Shuttering Civil Works</span>
                      <span className="font-bold text-slate-200">₹5,10,000</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-850">
                      <span>Plumbing, Electrical & Sanitary Fittings</span>
                      <span className="font-bold text-slate-200">₹2,80,000</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Total Estimated Budget:</span>
                    <span className="text-base font-black text-amber-400">₹32,48,000 (Incl. GST)</span>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

        </div>
      </section>

      {/* INTERACTIVE PROJECT COST ESTIMATOR */}
      <section id="estimator" className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-black uppercase text-amber-400 tracking-widest">
              Live Construction Cost Calculator
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Instant Project Budget & Material Estimator
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              Select your construction type and built-up area to get an accurate ballpark estimate based on current Guntur & Andhra Pradesh market rates.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8">
            
            {/* Step 1: Project Type Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                1. Select Construction Type:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "residential", label: "Residential Villa", icon: "🏡" },
                  { id: "duplex", label: "Luxury Duplex", icon: "🏰" },
                  { id: "commercial", label: "Commercial Hub", icon: "🏢" },
                  { id: "approval", label: "APCRDA Approval", icon: "📜" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setProjectType(item.id)}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      projectType === item.id
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="text-xl block mb-1">{item.icon}</span>
                    <span className="text-xs font-bold block">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Area Slider (if not flat approval) */}
            {projectType !== "approval" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    2. Built-Up Area (Sq. Ft.):
                  </label>
                  <span className="text-lg font-black text-amber-400">
                    {builtArea.toLocaleString()} <span className="text-xs font-normal text-slate-400">Sq Ft</span>
                  </span>
                </div>

                <input
                  type="range"
                  min="600"
                  max="10000"
                  step="100"
                  value={builtArea}
                  onChange={(e) => setBuiltArea(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
                />

                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>600 Sq Ft (Small Plot)</span>
                  <span>2,500 Sq Ft (Standard Villa)</span>
                  <span>10,000 Sq Ft (Commercial / Multi-Storey)</span>
                </div>
              </div>
            )}

            {/* Step 3: Finish Quality Grade */}
            {projectType !== "approval" && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  3. Construction & Material Finish Grade:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "standard", label: "Standard", sub: "Standard Cement & Finishes" },
                    { id: "premium", label: "Premium (Recommended)", sub: "Top Brand Cement, Teak Wood, Vitrified Tiles" },
                    { id: "luxury", label: "Ultra Luxury", sub: "Italian Marble, Smart Home, Glass Facades" }
                  ].map((grade) => (
                    <button
                      key={grade.id}
                      onClick={() => setQualityGrade(grade.id)}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        qualityGrade === grade.id
                          ? "bg-amber-500/15 border-amber-500 text-white"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-bold block">{grade.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{grade.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Calculation Output Box */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-850">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Estimated Construction Budget:
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                    {projectType === "approval" ? (
                      `₹25,000 - ₹65,000`
                    ) : (
                      `₹${(estimate.minCost / 100000).toFixed(2)} Lakhs - ₹${(estimate.maxCost / 100000).toFixed(2)} Lakhs`
                    )}
                  </div>
                  {projectType !== "approval" && (
                    <p className="text-[11px] text-amber-400 mt-1">
                      Avg Rate: ₹{estimate.ratePerSqFt} / Sq Ft (Turnkey Material + Labor)
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    const text = encodeURIComponent(
                      `Hello Er. Ramesh Naik garu,\n\nI used your online calculator for:\n` +
                      `• Type: ${projectType.toUpperCase()}\n` +
                      (projectType !== "approval" ? `• Area: ${builtArea} Sq Ft\n• Grade: ${qualityGrade.toUpperCase()}\n• Estimated Cost: ₹${(estimate.minCost / 100000).toFixed(2)} Lakhs\n` : "") +
                      `\nPlease share detailed BOQ and site inspection schedule.`
                    );
                    window.open(`https://wa.me/919533956730?text=${text}`, "_blank");
                  }}
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Get Official BOQ on WhatsApp</span>
                </button>
              </div>

              {/* Material Forecast Metrics */}
              {projectType !== "approval" && (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Estimated Cement:</span>
                    <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                      ~{estimate.cementBags} Bags
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Estimated Steel (TMT):</span>
                    <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                      ~{estimate.steelTonnes} Tonnes
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Estimated Duration:</span>
                    <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                      ~{estimate.durationMonths} Months
                    </span>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* REGIONAL OFFICES & DIRECT CONTACT SECTION */}
      <section id="offices" className="py-20 bg-slate-900/40 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-black uppercase text-indigo-400 tracking-widest">
              Physical Locations & Doorstep Reach
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Consult Our Engineers at 4 Regional Office Locations
            </h2>
            <p className="text-sm text-slate-400">
              Conveniently accessible across Guntur district and Vinukonda with complete digital file delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Office 1: Arundelpet */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
                🏢 1
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">Main Office (Arundelpet)</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Door No. 6-10-40, Arundelpet 10/2 Line, Beside Rama Chandra Imported Furniture Shop, GUNTUR - 522002.
                </p>
              </div>
              <p className="text-[10px] text-amber-400 font-semibold">📍 Landmark: Arundelpet 10th Line</p>
            </div>

            {/* Office 2: Kannavaarithota Corporate */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
                🏢 2
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">Corporate Office (Kannavaarithota)</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sivaprasad Apartment, Room No: S3, Kannavaarithota 5th Lane, Guntur - 522004.
                </p>
              </div>
              <p className="text-[10px] text-indigo-400 font-semibold">📍 Landmark: 5th Lane Sivaprasad Apts</p>
            </div>

            {/* Office 3: Brodipet */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                🏢 3
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">Branch Office (Brodipet)</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Rohini Plaza, 2nd Floor, Room No. 3, Beside Amaravathi Institute, Near Sweet Magic, Shankar Vilas Road, 4/1, Brodipet, Guntur - 2.
                </p>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold">📍 Landmark: Near Sweet Magic Brodipet</p>
            </div>

            {/* Office 4: Vinukonda */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                🏡 4
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">Regional Office (Vinukonda)</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Door No: 29-2160, Siddhartha Nagar, Vinukonda, Palnadu District - 522647.
                </p>
              </div>
              <p className="text-[10px] text-purple-400 font-semibold">📍 Landmark: Siddhartha Nagar</p>
            </div>

          </div>

          {/* Contact Bar */}
          <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-xl font-bold text-white">Direct Engineering Helpline</h3>
              <p className="text-xs text-slate-400">
                Call or WhatsApp Principal Civil Engineer Er. M. Ramesh Naik for urgent municipal approvals and site visits.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:9533956730"
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition"
              >
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>+91 9533956730</span>
              </a>

              <a
                href="tel:9550932101"
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition"
              >
                <Phone className="h-4 w-4 text-indigo-400" />
                <span>+91 9550932101</span>
              </a>

              <a
                href="mailto:maaranengineers2016@gmail.com"
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition"
              >
                <Mail className="h-4 w-4 text-amber-400" />
                <span>maaranengineers2016@gmail.com</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-slate-950 border-t border-slate-850 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                🏗️
              </div>
              <div>
                <span className="font-black text-white text-sm tracking-wider">MAARAN ENGINEERS & CONSULTANCY</span>
                <p className="text-[10px] text-slate-400">We Design Your Dream World • ConstructAI ERP</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400">
              <a href="#services" className="hover:text-white transition">Services</a>
              <a href="#approvals" className="hover:text-white transition">Approvals</a>
              <a href="#estimator" className="hover:text-white transition">Estimator</a>
              <Link to="/login" className="text-indigo-400 font-bold hover:underline">Portal Login</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} MAARAN Engineers & Consultancy. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                ConstructAI ERP v2.4 Online
              </span>
              <span>•</span>
              <span>ISO 9001:2015 Standards</span>
            </div>
          </div>

        </div>
      </footer>

      {/* CONSULTATION BOOKING MODAL */}
      <AnimatePresence>
        {showConsultModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6"
            >
              <button
                onClick={() => setShowConsultModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Sparkles className="h-4 w-4" />
                  <span>Service @ Your Doorstep</span>
                </div>
                <h3 className="text-xl font-black text-white">Book Free Engineering Consultation</h3>
                <p className="text-xs text-slate-400">
                  Connect directly with Er. M. Ramesh Naik for site plan drafting and municipal approval.
                </p>
              </div>

              {consultSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                    ✓
                  </div>
                  <h4 className="text-base font-bold text-white">WhatsApp Consultation Initiated!</h4>
                  <p className="text-xs text-slate-400">Connecting you with our engineering lead...</p>
                </div>
              ) : (
                <form onSubmit={handleSendWhatsAppConsultation} className="space-y-4 text-xs">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Naik"
                        value={consultForm.name}
                        onChange={(e) => setConsultForm({ ...consultForm, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Phone Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. 9533956730"
                        value={consultForm.phone}
                        onChange={(e) => setConsultForm({ ...consultForm, phone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Location / City</label>
                      <input
                        type="text"
                        placeholder="e.g. Guntur / Vinukonda"
                        value={consultForm.city}
                        onChange={(e) => setConsultForm({ ...consultForm, city: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Service Required</label>
                      <select
                        value={consultForm.service}
                        onChange={(e) => setConsultForm({ ...consultForm, service: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="House Planning & 3D Elevation">House Planning & 3D Elevation</option>
                        <option value="APCRDA / Municipal Approval">APCRDA / Municipal Approval</option>
                        <option value="Structural Design & Calculations">Structural Design & Calculations</option>
                        <option value="Bank Valuation & Estimation">Bank Valuation & Estimation</option>
                        <option value="Soil Testing & Land Survey">Soil Testing & Land Survey</option>
                        <option value="Turnkey Site Supervision">Turnkey Site Supervision</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Plot Dimensions / Built-Up Area</label>
                    <input
                      type="text"
                      placeholder="e.g. 30x40 (1200 Sq Ft) or 200 Sq Yards"
                      value={consultForm.plotSize}
                      onChange={(e) => setConsultForm({ ...consultForm, plotSize: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Additional Project Notes (Optional)</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Looking for G+1 duplex with north-facing Vaastu entry..."
                      value={consultForm.message}
                      onChange={(e) => setConsultForm({ ...consultForm, message: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Send Request to Er. Ramesh Naik (WhatsApp)</span>
                  </button>

                </form>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
