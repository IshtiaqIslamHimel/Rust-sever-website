import React from 'react';

export const BackgroundLandscape: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#060605] select-none">
      {/* 1. Atmospheric Sky & Sun/Sunset Radial Glow */}
      <div 
        className="absolute inset-0 opacity-85"
        style={{
          background: 'radial-gradient(ellipse at 50% 25%, rgba(198, 110, 42, 0.22) 0%, rgba(140, 65, 25, 0.12) 30%, rgba(20, 20, 17, 0.75) 65%, rgba(6, 6, 5, 0.98) 92%)'
        }}
      />

      {/* Warm Rust Ambient Spotlights */}
      <div className="absolute top-[18%] left-[20%] w-96 h-96 rounded-full bg-[#C66E2A]/10 blur-[120px]" />
      <div className="absolute top-[28%] right-[22%] w-[500px] h-[500px] rounded-full bg-[#B28A46]/10 blur-[140px]" />

      {/* 2. Patrol Helicopter / Cargo Plane Silhouette with Searchlight */}
      <div className="absolute top-[12%] right-[18%] md:right-[25%] opacity-70">
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Body */}
          <path d="M40 20 C40 12 55 10 75 12 C90 14 100 18 102 22 C100 25 80 26 60 25 C48 24 40 22 40 20 Z" fill="#0D0D0B" />
          {/* Rotor Blade */}
          <line x1="20" y1="10" x2="110" y2="10" stroke="#0D0D0B" strokeWidth="1.5" opacity="0.6" />
          <line x1="62" y1="10" x2="62" y2="15" stroke="#0D0D0B" strokeWidth="2" />
          {/* Tail Fin & Rotor */}
          <path d="M38 20 L15 15 L12 8 L8 8 L12 22 L20 20 Z" fill="#0D0D0B" />
          <line x1="8" y1="5" x2="8" y2="22" stroke="#0D0D0B" strokeWidth="1" />
          {/* Red Beacon Light */}
          <circle cx="62" cy="12" r="1.5" fill="#EF4444" className="animate-ping" />
          {/* Searchlight Cone */}
          <polygon points="75,24 15,100 -20,100" fill="url(#searchlightGrad)" opacity="0.15" />
          <defs>
            <linearGradient id="searchlightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#C66E2A" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Cloud & Smoke Layers */}
      <div className="absolute top-[28%] left-0 right-0 h-36 bg-gradient-to-r from-transparent via-[#C66E2A]/10 to-transparent blur-3xl opacity-40 transform -rotate-1" />
      <div className="absolute top-[40%] left-[8%] right-[8%] h-24 bg-gradient-to-r from-transparent via-[#2E2D2A]/30 to-transparent blur-2xl opacity-50" />

      {/* 3. SVG Layered Rust Landscape with Monuments & Mountains */}
      <svg 
        className="absolute bottom-0 left-0 right-0 w-full h-[68vh] md:h-[78vh] object-cover" 
        viewBox="0 0 1440 800" 
        preserveAspectRatio="none"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Layer A: Far Jagged Mountain Range */}
        <path 
          d="M0 520 L140 410 L280 470 L480 330 L660 450 L840 320 L1020 440 L1220 310 L1380 400 L1440 370 L1440 800 L0 800 Z" 
          fill="#141411" 
          opacity="0.85"
        />

        {/* Layer B: Monuments in Mid-Distance */}
        
        {/* --- MONUMENT 1: The Dome (Geodesic Sphere) around X: 220, Y: 430 --- */}
        <g id="rust-dome">
          <path d="M170 470 A 55 55 0 0 1 280 470 Z" fill="#0E0E0C" />
          {/* Structural struts / grid on dome */}
          <path d="M175 470 Q 225 420 275 470" stroke="#1A1A17" strokeWidth="1.5" fill="none" />
          <path d="M185 470 Q 225 435 265 470" stroke="#1A1A17" strokeWidth="1.5" fill="none" />
          <path d="M200 470 Q 225 450 250 470" stroke="#1A1A17" strokeWidth="1.5" fill="none" />
          <line x1="225" y1="415" x2="225" y2="470" stroke="#1A1A17" strokeWidth="1.5" />
          <line x1="200" y1="422" x2="250" y2="470" stroke="#1A1A17" strokeWidth="1" />
          <line x1="250" y1="422" x2="200" y2="470" stroke="#1A1A17" strokeWidth="1" />
          {/* Top Red Warning Beacon Light */}
          <circle cx="225" cy="414" r="2" fill="#EF4444" />
          <circle cx="225" cy="414" r="4" fill="#EF4444" opacity="0.4" className="animate-ping" />
        </g>

        {/* --- MONUMENT 2: Powerline Pylons / Grid Towers across hills --- */}
        <g id="power-pylons" fill="#0E0E0C" stroke="#0E0E0C">
          {/* Pylon 1 */}
          <path d="M520 480 L532 390 L538 390 L550 480 Z" />
          <line x1="510" y1="410" x2="560" y2="410" strokeWidth="2" />
          <line x1="515" y1="430" x2="555" y2="430" strokeWidth="2" />
          <line x1="520" y1="480" x2="550" y2="410" strokeWidth="1" />
          <line x1="550" y1="480" x2="520" y2="410" strokeWidth="1" />

          {/* Pylon 2 (smaller, further away) */}
          <path d="M780 460 L788 390 L792 390 L800 460 Z" />
          <line x1="772" y1="405" x2="808" y2="405" strokeWidth="1.5" />
          <line x1="776" y1="420" x2="804" y2="420" strokeWidth="1.5" />

          {/* Power Cables */}
          <path d="M510 410 Q 640 430 772 405" stroke="#181815" strokeWidth="1" fill="none" />
          <path d="M560 410 Q 670 430 808 405" stroke="#181815" strokeWidth="1" fill="none" />
        </g>

        {/* --- MONUMENT 3: Launch Site Gantry & Crane Crane tower (Right Side) --- */}
        <g id="launch-site" fill="#0B0B09">
          {/* Launch Pad Main Tower */}
          <rect x="1180" y="300" width="22" height="180" />
          {/* Cross Truss Braces */}
          <line x1="1180" y1="300" x2="1202" y2="340" stroke="#1A1A17" strokeWidth="1.5" />
          <line x1="1202" y1="300" x2="1180" y2="340" stroke="#1A1A17" strokeWidth="1.5" />
          <line x1="1180" y1="340" x2="1202" y2="380" stroke="#1A1A17" strokeWidth="1.5" />
          <line x1="1202" y1="340" x2="1180" y2="380" stroke="#1A1A17" strokeWidth="1.5" />
          <line x1="1180" y1="380" x2="1202" y2="420" stroke="#1A1A17" strokeWidth="1.5" />
          <line x1="1202" y1="380" x2="1180" y2="420" stroke="#1A1A17" strokeWidth="1.5" />
          {/* Horizontal Crane Arm */}
          <rect x="1140" y="295" width="110" height="8" />
          <line x1="1180" y1="295" x2="1245" y2="280" stroke="#0B0B09" strokeWidth="3" />
          <line x1="1191" y1="295" x2="1245" y2="280" stroke="#0B0B09" strokeWidth="2" />
          {/* Red Beacon at top of launch site */}
          <circle cx="1191" cy="278" r="2.5" fill="#EF4444" />
          <circle cx="1191" cy="278" r="6" fill="#EF4444" opacity="0.3" className="animate-pulse" />
        </g>

        {/* --- MONUMENT 4: Airfield Dish & Water Tower (Middle Right) --- */}
        <g id="airfield-monument" fill="#0C0C0A">
          {/* Radar Dish */}
          <path d="M960 440 L975 390 L985 395 L975 440 Z" />
          <path d="M945 380 Q 975 365 995 390 C 980 400 955 395 945 380 Z" />
          {/* Water Tower Sphere on legs */}
          <line x1="1040" y1="460" x2="1055" y2="400" stroke="#0C0C0A" strokeWidth="2.5" />
          <line x1="1070" y1="460" x2="1055" y2="400" stroke="#0C0C0A" strokeWidth="2.5" />
          <circle cx="1055" cy="390" r="18" />
        </g>

        {/* Layer C: Midground Mountain Peaks & Slopes */}
        <path 
          d="M-50 580 L120 430 L290 510 L490 360 L680 490 L890 380 L1090 490 L1290 370 L1490 480 L1490 800 L-50 800 Z" 
          fill="#0A0A08" 
          opacity="0.95"
        />

        {/* Layer D: Foreground Mountain Slopes */}
        <path 
          d="M0 640 L210 460 L420 560 L620 430 L840 570 L1060 420 L1260 520 L1440 440 L1440 800 L0 800 Z" 
          fill="#070706" 
        />

        {/* Layer E: Atmospheric Ground Fog & Rust Smoke */}
        <rect x="0" y="560" width="1440" height="120" fill="url(#rustFogGrad)" opacity="0.45" />

        <defs>
          <linearGradient id="rustFogGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C66E2A" stopOpacity="0" />
            <stop offset="40%" stopColor="#8C4119" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#060605" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* 4. Layer: Dense Pine Tree Forest Silhouette along Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[38vh] md:h-[45vh] pointer-events-none opacity-98">
        <svg 
          className="w-full h-full object-cover" 
          viewBox="0 0 1440 400" 
          preserveAspectRatio="none"
          fill="#060605" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Detailed Dense Pine Tree Treeline Silhouette */}
          <path d="
            M0 400 L0 280 
            L12 240 L18 250 L28 220 L32 230 L40 180 L48 230 L52 220 L62 250 L68 240 L80 280 
            L95 230 L102 240 L110 200 L115 210 L125 150 L135 210 L140 200 L148 240 L155 230 L170 290 
            L185 220 L192 235 L200 190 L208 200 L218 140 L228 200 L236 190 L244 235 L251 220 L270 300 
            L285 250 L292 260 L300 210 L308 225 L318 170 L328 225 L336 210 L344 260 L351 250 L370 310 
            L385 210 L392 225 L400 180 L408 190 L418 130 L428 190 L436 180 L444 225 L451 210 L470 290 
            L485 240 L492 250 L500 200 L508 215 L518 160 L528 215 L536 200 L544 250 L551 240 L570 300 
            L585 220 L592 235 L600 190 L608 200 L618 140 L628 200 L636 190 L644 235 L651 220 L670 290 
            L685 260 L692 270 L700 220 L708 235 L718 180 L728 235 L736 220 L744 270 L751 260 L770 310 
            L785 230 L792 245 L800 200 L808 210 L818 150 L828 210 L836 200 L844 245 L851 230 L870 290 
            L885 210 L892 225 L900 180 L908 190 L918 130 L928 190 L936 180 L944 225 L951 210 L970 300 
            L985 250 L992 260 L1000 210 L1008 225 L1018 170 L1028 225 L1036 210 L1044 260 L1051 250 L1070 310 
            L1085 220 L1092 235 L1100 190 L1108 200 L1118 140 L1128 200 L1136 190 L1144 235 L1151 220 L1170 290 
            L1185 240 L1192 250 L1200 200 L1208 215 L1218 160 L1228 215 L1236 200 L1244 250 L1251 240 L1270 300 
            L1285 210 L1292 225 L1300 170 L1308 185 L1318 120 L1328 185 L1336 170 L1344 225 L1351 210 L1370 290 
            L1385 230 L1392 245 L1400 200 L1408 210 L1418 150 L1428 210 L1436 200 L1440 240 L1440 400 Z
          " />
        </svg>
      </div>

      {/* 5. Floating Fire Embers / Radiation Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-1.5 h-1.5 rounded-full bg-[#C66E2A] absolute bottom-[22%] left-[18%] opacity-70 animate-pulse shadow-[0_0_8px_#C66E2A]" />
        <div className="w-1 h-1 rounded-full bg-[#B28A46] absolute bottom-[38%] left-[42%] opacity-60 animate-pulse shadow-[0_0_6px_#B28A46]" />
        <div className="w-2 h-2 rounded-full bg-[#C66E2A] absolute bottom-[28%] right-[22%] opacity-80 animate-pulse shadow-[0_0_10px_#C66E2A]" />
        <div className="w-1 h-1 rounded-full bg-[#B28A46] absolute bottom-[42%] right-[12%] opacity-50 animate-pulse shadow-[0_0_6px_#B28A46]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] absolute bottom-[18%] left-[62%] opacity-40 animate-pulse shadow-[0_0_8px_#EF4444]" />
      </div>

      {/* 6. Dark Gradient Vignettes for Perfect Card Contrast */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#060605] via-[#060605]/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#060605] via-[#060605]/85 to-transparent" />
    </div>
  );
};


