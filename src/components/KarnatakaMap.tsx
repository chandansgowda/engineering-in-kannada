import { useEffect, useState } from "react";
import { KARNATAKA_PATH, KARNATAKA_VIEWBOX } from "./karnatakaPath";

/** Karnataka flag colours. */
const YELLOW = "#FFD700";
const RED = "#E8112D";

interface City {
  id: string;
  kn: string;
  en: string;
  x: number;
  y: number;
  /** Label offset relative to the node. */
  lx: number;
  ly: number;
  anchor: "start" | "end" | "middle";
}

// Positions come from real lat/long, projected with the same transform as the outline.
const CITIES: City[] = [
  { id: "blr", kn: "ಬೆಂಗಳೂರು", en: "Bengaluru", x: 306.1, y: 489.5, lx: 0, ly: -18, anchor: "middle" },
  { id: "mys", kn: "ಮೈಸೂರು", en: "Mysuru", x: 225.4, y: 548.6, lx: -12, ly: 4, anchor: "end" },
  { id: "mlr", kn: "ಮಂಗಳೂರು", en: "Mangaluru", x: 74.8, y: 494.6, lx: 12, ly: 4, anchor: "start" },
  { id: "hbl", kn: "ಹುಬ್ಬಳ್ಳಿ", en: "Hubballi", x: 97.5, y: 280.3, lx: 12, ly: 4, anchor: "start" },
  { id: "bgm", kn: "ಬೆಳಗಾವಿ", en: "Belagavi", x: 44.6, y: 237.9, lx: 4, ly: -13, anchor: "start" },
  { id: "klb", kn: "ಕಲಬುರಗಿ", en: "Kalaburagi", x: 241.9, y: 108.5, lx: -12, ly: 4, anchor: "end" },
  { id: "smg", kn: "ಶಿವಮೊಗ್ಗ", en: "Shivamogga", x: 135.0, y: 405.7, lx: 12, ly: 4, anchor: "start" },
  { id: "bly", kn: "ಬಳ್ಳಾರಿ", en: "Ballari", x: 249.2, y: 300.0, lx: 12, ly: 4, anchor: "start" },
  { id: "dvg", kn: "ದಾವಣಗೆರೆ", en: "Davanagere", x: 164.8, y: 359.0, lx: 12, ly: 4, anchor: "start" },
  { id: "vjp", kn: "ವಿಜಯಪುರ", en: "Vijayapura", x: 147.0, y: 152.2, lx: 12, ly: 4, anchor: "start" },
];

const byId = Object.fromEntries(CITIES.map((c) => [c.id, c]));

// Bengaluru is the hub; a few regional links make it read as a network.
const LINKS: [string, string][] = [
  ["blr", "mys"],
  ["blr", "mlr"],
  ["blr", "smg"],
  ["blr", "dvg"],
  ["blr", "bly"],
  ["blr", "klb"],
  ["dvg", "hbl"],
  ["hbl", "bgm"],
  ["hbl", "vjp"],
  ["vjp", "klb"],
  ["smg", "mlr"],
];

/** Gentle arc between two cities so the network feels organic. */
function arc(a: City, b: City) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const bend = 0.18;
  return `M${a.x},${a.y} Q${mx - dy * bend},${my + dx * bend} ${b.x},${b.y}`;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Animated Karnataka: the outline draws itself, fills with a dot-matrix in the
 * state flag's yellow and red, then cities light up and data packets travel the
 * network out from Bengaluru.
 */
export function KarnatakaMap({ className = "" }: { className?: string }) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className={`ka-map relative ${className}`} role="img" aria-label="Animated map of Karnataka with cities connected in a network">
      <svg viewBox={KARNATAKA_VIEWBOX} className="h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="ka-flag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={YELLOW} />
            <stop offset="0.46" stopColor={YELLOW} />
            <stop offset="0.54" stopColor={RED} />
            <stop offset="1" stopColor={RED} />
          </linearGradient>
          <linearGradient id="ka-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE24D" />
            <stop offset="0.5" stopColor="#FFB000" />
            <stop offset="1" stopColor="#FF4D4D" />
          </linearGradient>
          <linearGradient id="ka-scan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <pattern id="ka-dots" width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="4.5" cy="4.5" r="1.9" fill="#fff" />
          </pattern>
          <mask id="ka-dot-mask">
            <path d={KARNATAKA_PATH} fill="url(#ka-dots)" />
          </mask>
          <clipPath id="ka-clip">
            <path d={KARNATAKA_PATH} />
          </clipPath>
          <filter id="ka-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <radialGradient id="ka-node">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.45" stopColor={YELLOW} />
            <stop offset="1" stopColor={YELLOW} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft flag-coloured aura behind the state */}
        <path d={KARNATAKA_PATH} fill="url(#ka-flag)" filter="url(#ka-glow)" className="ka-aura" />

        {/* Base tint + dot-matrix fill in flag colours */}
        <path d={KARNATAKA_PATH} fill="url(#ka-flag)" className="ka-tint" />
        <rect width="400" height="621" fill="url(#ka-flag)" mask="url(#ka-dot-mask)" className="ka-dots" />

        {/* Scanner sweep */}
        {!reduced && (
          <g clipPath="url(#ka-clip)">
            <rect x="0" y="-80" width="400" height="80" fill="url(#ka-scan)" className="ka-scan" />
          </g>
        )}

        {/* Outline that draws itself */}
        <path
          d={KARNATAKA_PATH}
          pathLength={1}
          fill="none"
          stroke="url(#ka-stroke)"
          strokeWidth="2.4"
          strokeLinejoin="round"
          className="ka-outline"
        />

        {/* Network */}
        <g className="ka-links">
          {LINKS.map(([a, b], i) => (
            <path
              key={`${a}-${b}`}
              id={`ka-link-${i}`}
              d={arc(byId[a], byId[b])}
              pathLength={1}
              fill="none"
              stroke="#FFF4B3"
              strokeOpacity="0.55"
              strokeWidth="1.2"
              strokeDasharray="0.012 0.018"
              className="ka-link"
              style={{ animationDelay: `${2.1 + i * 0.08}s` }}
            />
          ))}
        </g>

        {/* Data packets travelling the network */}
        {!reduced &&
          LINKS.map(([a, b], i) => (
            <circle
              key={`p-${a}-${b}`}
              r="3"
              fill="#fff"
              className="ka-packet"
              style={{ animationDelay: `${3 + i * 0.35}s` }}
            >
              <animateMotion
                dur={`${2.6 + (i % 4) * 0.5}s`}
                begin={`${3 + i * 0.35}s`}
                repeatCount="indefinite"
                keyPoints={i % 2 ? "1;0" : "0;1"}
                keyTimes="0;1"
                calcMode="linear"
              >
                <mpath href={`#ka-link-${i}`} />
              </animateMotion>
            </circle>
          ))}

        {/* Cities */}
        {CITIES.map((c, i) => {
          const hub = c.id === "blr";
          return (
            <g key={c.id} className="ka-city" style={{ animationDelay: `${1.6 + i * 0.09}s` }}>
              {!reduced && (
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={hub ? 9 : 6}
                  fill="none"
                  stroke={hub ? YELLOW : "#FFE24D"}
                  strokeWidth="1.5"
                  className="ka-ping"
                  style={{ animationDelay: `${2.4 + i * 0.27}s`, transformOrigin: `${c.x}px ${c.y}px` }}
                />
              )}
              <circle cx={c.x} cy={c.y} r={hub ? 16 : 10} fill="url(#ka-node)" opacity="0.6" />
              <circle cx={c.x} cy={c.y} r={hub ? 5.5 : 3.6} fill={hub ? YELLOW : "#fff"} stroke="#1A1A1A" strokeWidth="1.5" />
              <text
                x={c.x + c.lx}
                y={c.y + c.ly}
                textAnchor={c.anchor}
                className="ka-label notranslate font-kannada"
                fontSize={hub ? 15 : 11.5}
                fontWeight={hub ? 800 : 600}
                fill={hub ? "#fff" : "rgba(255,255,255,0.78)"}
              >
                <title>{c.en}</title>
                {c.kn}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
