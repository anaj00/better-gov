import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Building2,
  CheckCircle2,
  Clock3,
  Target,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Logo } from "../components";
import DrillDownSection from "../components/DrillDownSection";

const stats = [
  {
    icon: Building2,
    value: "12,842",
    label: "Total Requests",
    change: "12.6%",
    note: "vs last 30 days",
    tone: "blue",
    down: false,
  },
  {
    icon: CheckCircle2,
    value: "9,532",
    label: "Completed",
    change: "15.3%",
    note: "vs last 30 days",
    tone: "blue",
    down: false,
  },
  {
    icon: Clock3,
    value: "6.4 days",
    label: "Avg. Processing Time",
    change: "8.7%",
    note: "vs last 30 days",
    tone: "red",
    down: true,
  },
  {
    icon: Target,
    value: "92.1%",
    label: "On-Time Rate",
    change: "4.2%",
    note: "vs last 30 days",
    tone: "red",
    down: false,
  },
];

function AnimatedValue({
  value,
  down = false,
}: {
  value: string;
  down?: boolean;
}) {
  const [display, setDisplay] = useState("0");
  const [changing, setChanging] = useState(false);
  const [previousDigit, setPreviousDigit] = useState("0");
  useEffect(() => {
    const match = value.match(/^([\d,.]+)(.*)$/);
    if (
      !match ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const reducedFrame = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(reducedFrame);
    }
    const target = Number(match[1].replaceAll(",", ""));
    const decimals = match[1].includes(".") ? match[1].split(".")[1].length : 0;
    const suffix = match[2];
    const initial = target * (down ? 1.12 : 0.86);
    const start = performance.now();
    let frame = 0;
    let interval = 0;
    let highlightTimer = 0;
    const format = (number: number) =>
      `${
        number.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      }${suffix}`;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1100, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(format(initial + (target - initial) * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        let current = target;
        let currentText = format(target);
        const step = target >= 1000
          ? Math.max(1, Math.round(target * 0.0002))
          : 0.1;
        interval = window.setInterval(() => {
          const oldDigit = [...currentText]
            .reverse()
            .find((character) => /\d/.test(character)) || "0";
          current += down ? -step : step;
          if (suffix.includes("%")) {
            current = Math.min(current, 99.9);
          }
          if (down) {
            current = Math.max(current, 0.1);
          }
          currentText = format(current);
          setPreviousDigit(oldDigit);
          setDisplay(currentText);
          setChanging(true);
          clearTimeout(highlightTimer);
          highlightTimer = window.setTimeout(() => setChanging(false), 650);
        }, 2500);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(interval);
      clearTimeout(highlightTimer);
    };
  }, [value, down]);
  let finalDigitIndex = -1;
  [...display].forEach((character, index) => {
    if (/\d/.test(character)) finalDigitIndex = index;
  });
  return (
    <span className="stat-number" aria-live="polite">
      {[...display].map((character, index) =>
        changing && index === finalDigitIndex
          ? (
            <span className="odometer-window" key={`${display}-${index}`}>
              <span className="odometer-track">
                <span>{previousDigit}</span>
                <span>{character}</span>
              </span>
            </span>
          )
          : <span key={`${index}-${character}`}>{character}</span>
      )}
    </span>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState("");

  const trackService = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/status?serial=${encodeURIComponent(trackingNumber.trim())}`);
  };

  return (
    <Layout>
      <main className="brand-home">
        <section className="brand-hero">
          <div className="container brand-hero-grid">
            <div className="brand-hero-copy">
              <Logo />
              <h1>
                Government
                <br />
                processes,
                <br />
                made <em>easier.</em>
              </h1>
              <p>Track your government service with ease.</p>
              <form className="hero-tracking-form" onSubmit={trackService}>
                <label htmlFor="hero-tracking-number">
                  Enter your tracking number
                </label>
                <div>
                  <input
                    id="hero-tracking-number"
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value)}
                    placeholder="TRACK-XXXXXXXXXXXX"
                    autoComplete="off"
                    required
                  />
                  <button type="submit">
                    Next <ArrowRight />
                  </button>
                </div>
              </form>
            </div>
            <div className="civic-visual" aria-hidden="true" />
          </div>
          <section
            id="stats"
            className="stats-wrap container"
            aria-label="National process statistics"
          >
            <div className="brand-stats">
              {stats.map(
                ({ icon: Icon, value, label, change, note, tone, down }) => (
                  <article className={`brand-stat ${tone}`} key={label}>
                    <div className="stat-main">
                      <span className="stat-icon">
                        <Icon />
                      </span>
                      <div>
                        <strong>
                          <AnimatedValue value={value} down={down} />
                        </strong>
                        <p>{label}</p>
                      </div>
                    </div>
                    <div className="stat-change">
                      {down ? <ArrowDown /> : <ArrowUp />}
                      <b>{change}</b>
                      <small>{note}</small>
                    </div>
                  </article>
                ),
              )}
            </div>
            <a className="hero-scroll-indicator" href="#requests-by-region">
              <span>Scroll to view more stats</span>
              <ArrowDown />
            </a>
          </section>
        </section>
        <DrillDownSection />
      </main>
    </Layout>
  );
}
