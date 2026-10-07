import { useEffect, useMemo, useState } from "react";
import { KARNATAKA_PATH, KARNATAKA_VIEWBOX } from "./karnatakaPath";

/** Karnataka flag colours. */
const YELLOW = "#FFD700";
const RED = "#E8112D";

/* Same equirectangular projection used to generate KARNATAKA_PATH. */
const MIN_LON = 74.08801970874259;
const MAX_LAT = 18.456531902025688;
const K = 0.9658378880424201;
const SCALE = 87.4259289688178;
const PAD = 10;
const project = (lat: number, lon: number) => ({
  x: PAD + (lon - MIN_LON) * K * SCALE,
  y: PAD + (MAX_LAT - lat) * SCALE,
});

/** Headquarters of all 31 districts of Karnataka. */
const DISTRICTS: { kn: string; en: string; lat: number; lon: number }[] = [
  { kn: "ಬಾಗಲಕೋಟೆ", en: "Bagalkote", lat: 16.1817, lon: 75.6958 },
  { kn: "ಬಳ್ಳಾರಿ", en: "Ballari", lat: 15.1394, lon: 76.9214 },
  { kn: "ಬೆಳಗಾವಿ", en: "Belagavi", lat: 15.8497, lon: 74.4977 },
  { kn: "ಬೆಂಗಳೂರು", en: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { kn: "ದೊಡ್ಡಬಳ್ಳಾಪುರ", en: "Doddaballapura", lat: 13.2923, lon: 77.5374 },
  { kn: "ಬೀದರ್", en: "Bidar", lat: 17.9104, lon: 77.5199 },
  { kn: "ಚಾಮರಾಜನಗರ", en: "Chamarajanagara", lat: 11.9261, lon: 76.9437 },
  { kn: "ಚಿಕ್ಕಬಳ್ಳಾಪುರ", en: "Chikkaballapura", lat: 13.4355, lon: 77.7315 },
  { kn: "ಚಿಕ್ಕಮಗಳೂರು", en: "Chikkamagaluru", lat: 13.3161, lon: 75.772 },
  { kn: "ಚಿತ್ರದುರ್ಗ", en: "Chitradurga", lat: 14.2251, lon: 76.398 },
  { kn: "ಮಂಗಳೂರು", en: "Mangaluru", lat: 12.9141, lon: 74.856 },
  { kn: "ದಾವಣಗೆರೆ", en: "Davanagere", lat: 14.4644, lon: 75.9218 },
  { kn: "ಧಾರವಾಡ", en: "Dharwad", lat: 15.4589, lon: 75.0078 },
  { kn: "ಗದಗ", en: "Gadag", lat: 15.4315, lon: 75.6355 },
  { kn: "ಹಾಸನ", en: "Hassan", lat: 13.0072, lon: 76.0962 },
  { kn: "ಹಾವೇರಿ", en: "Haveri", lat: 14.7951, lon: 75.3991 },
  { kn: "ಕಲಬುರಗಿ", en: "Kalaburagi", lat: 17.3297, lon: 76.8343 },
  { kn: "ಮಡಿಕೇರಿ", en: "Madikeri", lat: 12.4244, lon: 75.7382 },
  { kn: "ಕೋಲಾರ", en: "Kolar", lat: 13.1362, lon: 78.1292 },
  { kn: "ಕೊಪ್ಪಳ", en: "Koppal", lat: 15.35, lon: 76.155 },
  { kn: "ಮಂಡ್ಯ", en: "Mandya", lat: 12.5218, lon: 76.8951 },
  { kn: "ಮೈಸೂರು", en: "Mysuru", lat: 12.2958, lon: 76.6394 },
  { kn: "ರಾಯಚೂರು", en: "Raichur", lat: 16.212, lon: 77.3439 },
  { kn: "ರಾಮನಗರ", en: "Ramanagara", lat: 12.7209, lon: 77.2799 },
  { kn: "ಶಿವಮೊಗ್ಗ", en: "Shivamogga", lat: 13.9299, lon: 75.5681 },
  { kn: "ತುಮಕೂರು", en: "Tumakuru", lat: 13.3379, lon: 77.1173 },
  { kn: "ಉಡುಪಿ", en: "Udupi", lat: 13.3409, lon: 74.7421 },
  { kn: "ಕಾರವಾರ", en: "Karwar", lat: 14.814, lon: 74.1297 },
  { kn: "ವಿಜಯಪುರ", en: "Vijayapura", lat: 16.8302, lon: 75.71 },
  { kn: "ಯಾದಗಿರಿ", en: "Yadgir", lat: 16.77, lon: 77.1376 },
  { kn: "ಹೊಸಪೇಟೆ", en: "Hosapete", lat: 15.2689, lon: 76.3909 },
];

const NODES = DISTRICTS.map((d) => ({ ...d, ...project(d.lat, d.lon) }));

// Pop the nodes in as a ripple from the middle of the state.
const CENTER = { x: 200, y: 330 };
const RIPPLE_DELAY = NODES.map((n) => Math.hypot(n.x - CENTER.x, n.y - CENTER.y) / 260);

/** Mesh: every district links to its two nearest neighbours. */
const EDGES: [number, number][] = (() => {
  const seen = new Set<string>();
  const out: [number, number][] = [];
  NODES.forEach((a, i) => {
    NODES.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push([i, j]);
        }
      });
  });
  return out;
})();

/** Spotlight order: a fixed shuffle so consecutive districts are far apart. */
const SPOTLIGHT = (() => {
  const order = NODES.map((_, i) => i);
  let seed = 7;
  for (let i = order.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
})();

function arc(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const bend = 0.15;
  return `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${(mx - (b.y - a.y) * bend).toFixed(1)},${(my + (b.x - a.x) * bend).toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
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
 * Animated Karnataka in the state flag's colours. The outline draws itself, all
 * 31 district headquarters light up as one connected network, and a spotlight
 * travels through every district in turn (hover any dot to see its name).
 */
export function KarnatakaMap({ className = "" }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const [spot, setSpot] = useState(-1);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    let step = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      setSpot(SPOTLIGHT[0]);
      interval = setInterval(() => {
        step = (step + 1) % SPOTLIGHT.length;
        setSpot(SPOTLIGHT[step]);
      }, 1900);
    }, 3200);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [reduced]);

  const active = hover ?? spot;
  const packets = useMemo(() => EDGES.filter((_, i) => i % 3 === 0), []);

  return (
    <div
      className={`ka-map relative ${className}`}
      role="img"
      aria-label="Animated map of Karnataka connecting all 31 district headquarters"
    >
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

        <path d={KARNATAKA_PATH} fill="url(#ka-flag)" filter="url(#ka-glow)" className="ka-aura" />
        <path d={KARNATAKA_PATH} fill="url(#ka-flag)" className="ka-tint" />
        <rect width="400" height="621" fill="url(#ka-flag)" mask="url(#ka-dot-mask)" className="ka-dots" />

        {!reduced && (
          <g clipPath="url(#ka-clip)">
            <rect x="0" y="-80" width="400" height="80" fill="url(#ka-scan)" className="ka-scan" />
          </g>
        )}

        <path
          d={KARNATAKA_PATH}
          pathLength={1}
          fill="none"
          stroke="url(#ka-stroke)"
          strokeWidth="2.4"
          strokeLinejoin="round"
          className="ka-outline"
        />

        {/* District network */}
        <g>
          {EDGES.map(([a, b], i) => (
            <path
              key={`${a}-${b}`}
              id={`ka-edge-${a}-${b}`}
              d={arc(NODES[a], NODES[b])}
              pathLength={1}
              fill="none"
              stroke="#FFF4B3"
              strokeOpacity={active === a || active === b ? 0.95 : 0.4}
              strokeWidth={active === a || active === b ? 1.6 : 1}
              strokeDasharray="0.03 0.04"
              className="ka-link"
              style={{ animationDelay: `${2 + (i % 12) * 0.06}s` }}
            />
          ))}
        </g>

        {!reduced &&
          packets.map(([a, b], i) => (
            <circle
              key={`p-${a}-${b}`}
              r="2.6"
              fill="#fff"
              className="ka-packet"
              style={{ animationDelay: `${3 + i * 0.3}s` }}
            >
              <animateMotion
                dur={`${2.2 + (i % 4) * 0.45}s`}
                begin={`${3 + i * 0.3}s`}
                repeatCount="indefinite"
                keyPoints={i % 2 ? "1;0" : "0;1"}
                keyTimes="0;1"
                calcMode="linear"
              >
                <mpath href={`#ka-edge-${a}-${b}`} />
              </animateMotion>
            </circle>
          ))}

        {/* District headquarters */}
        {NODES.map((n, i) => {
          const on = active === i;
          return (
            <g
              key={n.en}
              className="ka-city"
              style={{ animationDelay: `${1.5 + RIPPLE_DELAY[i]}s` }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`${n.kn} · ${n.en}`}</title>
              <circle cx={n.x} cy={n.y} r="11" fill="transparent" />
              {on && !reduced && (
                <circle
                  key={`ping-${i}`}
                  cx={n.x}
                  cy={n.y}
                  r="7"
                  fill="none"
                  stroke={YELLOW}
                  strokeWidth="1.5"
                  className="ka-ping"
                  style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                />
              )}
              <circle cx={n.x} cy={n.y} r={on ? 14 : 8} fill="url(#ka-node)" opacity={on ? 0.9 : 0.45} className="transition-all duration-500" />
              <circle
                cx={n.x}
                cy={n.y}
                r={on ? 5 : 3}
                fill={on ? YELLOW : "#fff"}
                stroke="#1A1A1A"
                strokeWidth="1.3"
                className="transition-all duration-500"
              />
            </g>
          );
        })}

        {/* Spotlight label, drawn last so it sits above everything */}
        {active >= 0 && <SpotLabel key={active} node={NODES[active]} />}
      </svg>
    </div>
  );
}

function SpotLabel({ node }: { node: (typeof NODES)[number] }) {
  const below = node.y < 60;
  const anchor = node.x < 80 ? "start" : node.x > 320 ? "end" : "middle";
  const dx = anchor === "start" ? -6 : anchor === "end" ? 6 : 0;
  const y = below ? node.y + 30 : node.y - 26;
  return (
    <g className="ka-spot-label notranslate" pointerEvents="none">
      <text x={node.x + dx} y={y} textAnchor={anchor} className="ka-label font-kannada" fontSize="17" fontWeight="800" fill="#fff">
        {node.kn}
      </text>
      <text x={node.x + dx} y={y + 14} textAnchor={anchor} className="ka-label" fontSize="10" fontWeight="600" fill="rgba(255,255,255,0.65)" letterSpacing="0.06em">
        {node.en.toUpperCase()}
      </text>
    </g>
  );
}
