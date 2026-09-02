"use client";

import { useEffect, useRef, useState, useMemo, type ReactNode } from "react";

/* ─── Types ──────────────────────────────────────────────────── */
type Category =
    | "Getting Started"
    | "Deposits & Payments"
    | "Withdrawals & Returns"
    | "Security & Account";

interface Faq {
    question: string;
    answer: string;
    category: Category;
}

/* ─── Data (tagged into categories) ──────────────────────────── */
const FAQS: Faq[] = [
    { category: "Getting Started", question: "What is Merlion Asset Holdings?", answer: "Merlion Asset Holdings is a digital investment platform that provides access to professionally managed investment funds focused on digital assets and global market opportunities." },
    { category: "Getting Started", question: "Who can invest?", answer: "Our platform is designed for both new and experienced investors. You do not need prior trading experience to get started." },
    { category: "Getting Started", question: "Do I need prior investment experience?", answer: "No. Merlion Asset Holdings is designed to make investing simple and accessible for everyone, regardless of prior experience." },
    // { category: "Getting Started", question: "How do I start investing?", answer: "Creating an account takes only a few minutes. Register an account, complete identity verification, choose an investment fund, make a deposit, and track your investments through your dashboard." },
    // { category: "Getting Started", question: "What is the minimum investment amount?", answer: "Minimum investment amounts vary by fund. You can explore each fund's details page to view the minimum and maximum investment limits for each plan." },
    // { category: "Getting Started", question: "Can I invest in multiple funds?", answer: "Yes. You can diversify your portfolio by investing in multiple funds based on your investment goals and risk preferences." },

    { category: "Deposits & Payments", question: "Which payment methods do you support?", answer: "We currently support USD bank transfers, Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Solana (SOL), and TRON (TRX). Available payment methods may vary by region." },
    { category: "Deposits & Payments", question: "How are deposits verified?", answer: "After completing your transfer, upload your payment receipt or transaction hash (TXID). Our team manually verifies each deposit before crediting your account." },
    // { category: "Deposits & Payments", question: "How long does deposit verification take?", answer: "Most cryptocurrency deposits are verified within 5 to 30 minutes after sufficient network confirmations. Bank transfers are generally processed within 1 to 3 business days." },

    { category: "Withdrawals & Returns", question: "Can I withdraw my investment at any time?", answer: "Withdrawal policies depend on the specific investment plan. Some funds may include lock-in periods or early withdrawal penalties. Please review each fund's terms and conditions before investing." },
    { category: "Withdrawals & Returns", question: "Are returns guaranteed?", answer: "No. All investments involve risk, and returns are not guaranteed. Past performance does not guarantee future results." },
    // { category: "Withdrawals & Returns", question: "Will I receive investment reports?", answer: "Yes. You can access transaction history, portfolio summaries, and investment updates directly from your dashboard." },
    // { category: "Withdrawals & Returns", question: "Where can I track my investments?", answer: "You can monitor your portfolio, deposits, transactions, investment performance, and account activity through your investor dashboard." },

    { category: "Security & Account", question: "How do you protect my information?", answer: "We use industry-standard security measures, encrypted connections, secure authentication processes, and strict data protection practices to help safeguard your personal information." },
    // { category: "Security & Account", question: "What documents are required for identity verification?", answer: "You may be asked to provide a government-issued photo ID, proof of address, and other documents required to comply with applicable regulations." },
    // { category: "Security & Account", question: "How can I contact support?", answer: "Our support team is available 24/7. You can reach us through email, the contact form on our website, or the support center within your investor dashboard." },
];

const CATEGORIES: Category[] = [
    "Getting Started",
    "Deposits & Payments",
    "Withdrawals & Returns",
    "Security & Account",
];

/* ─── Single accordion item ──────────────────────────────────── */
function FaqItem({
    faq,
    index,
    open,
    onToggle,
}: {
    faq: Faq;
    index: number;
    open: boolean;
    onToggle: () => void;
}) {
    const bodyRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number>(0);

    useEffect(() => {
        if (bodyRef.current) setHeight(bodyRef.current.scrollHeight);
    }, [faq.answer]);

    return (
        <div className={`faq__item ${open ? "is-open" : ""}`}>
            <button
                className="faq__q"
                onClick={onToggle}
                aria-expanded={open}
            >
                <span className="faq__num">{String(index + 1).padStart(2, "0")}</span>
                <span className="faq__qText">{faq.question}</span>
                <span className="faq__icon" aria-hidden>
                    <span className="faq__iconBar faq__iconBar--h" />
                    <span className="faq__iconBar faq__iconBar--v" />
                </span>
            </button>

            <div
                className="faq__a"
                style={{ height: open ? height : 0 }}
            >
                <div ref={bodyRef} className="faq__aInner">
                    <p>{faq.answer}</p>
                </div>
            </div>
        </div>
    );
}

/* ─── Section ────────────────────────────────────────────────── */
export default function FaqSection() {
    const ref = useRef<HTMLElement>(null);
    const [active, setActive] = useState<boolean>(false);
    const [filter, setFilter] = useState<Category | "All">("All");
    const [openIdx, setOpenIdx] = useState<number>(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setActive(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const visible = useMemo<Faq[]>(
        () => (filter === "All" ? FAQS : FAQS.filter((f) => f.category === filter)),
        [filter]
    );

    return (
        <section ref={ref} className="faq">
            <style>{css}</style>

            <div className="faq__bgGrid" aria-hidden />
            <div className="faq__glow" aria-hidden />

            <div className="faq__inner">
                {/* LEFT — sticky intro rail */}
                <aside
                    className="faq__aside"
                    style={{
                        opacity: active ? 1 : 0,
                        transform: active ? "translateY(0)" : "translateY(24px)",
                    }}
                >
                    <div className="faq__eyebrow">
                        <span className="faq__eyebrowDot" />
                        <span>Support Center</span>
                    </div>

                    <h2 className="faq__title">
                        Questions,
                        <br />
                        <span className="faq__titleAccent">answered clearly</span>.
                    </h2>

                    <p className="faq__lede">
                        Everything you need to know about investing with Merlion — from getting
                        started to deposits, withdrawals, and account security.
                    </p>

                    {/* Category filter */}
                    <div className="faq__filters">
                        <button
                            className={`faq__chip ${filter === "All" ? "is-on" : ""}`}
                            onClick={() => {
                                setFilter("All");
                                setOpenIdx(0);
                            }}
                        >
                            All
                        </button>
                        {CATEGORIES.map((c) => (
                            <button
                                key={c}
                                className={`faq__chip ${filter === c ? "is-on" : ""}`}
                                onClick={() => {
                                    setFilter(c);
                                    setOpenIdx(0);
                                }}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* Contact prompt */}
                    <div className="faq__contact">
                        <div className="faq__contactPulse">
                            <span className="faq__contactRing" />
                            <span className="faq__contactDot" />
                        </div>
                        <div>
                            <p className="faq__contactTitle">Still have questions?</p>
                            <a href="/contact" className="faq__contactLink">
                                Talk to our team
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </aside>

                {/* RIGHT — accordion */}
                <div
                    className="faq__list"
                    style={{
                        opacity: active ? 1 : 0,
                        transform: active ? "translateY(0)" : "translateY(24px)",
                    }}
                >
                    {visible.map((faq, i) => (
                        <FaqItem
                            key={faq.question}
                            faq={faq}
                            index={i}
                            open={openIdx === i}
                            onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ────────────────────────────────────────────────────────────
   Styles — scoped under .faq. White background, navy + blue
   accents. Responsive 1-col → 2-col. Reduced-motion safe.
   ──────────────────────────────────────────────────────────── */
const css = `
.faq{
  --navy:#081B3A; --accent:#2563EB; --accent-light:#60A5FA;
  --line:rgba(8,27,58,.1); --muted:#64748B;
  position:relative; width:100%; overflow:hidden; isolation:isolate;
  background:#FFFFFF;
  font-family:var(--font-inter, ui-sans-serif, system-ui, sans-serif);
}
.faq *{ box-sizing:border-box; }

.faq__bgGrid{ position:absolute; inset:0; z-index:0; pointer-events:none; opacity:.6;
  background-image:
    linear-gradient(rgba(8,27,58,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(8,27,58,.03) 1px, transparent 1px);
  background-size:60px 60px;
  -webkit-mask-image:radial-gradient(100% 80% at 80% 0%, #000 30%, transparent 75%);
          mask-image:radial-gradient(100% 80% at 80% 0%, #000 30%, transparent 75%); }
.faq__glow{ position:absolute; top:-15%; right:-10%; width:44vw; height:44vw;
  max-width:560px; max-height:560px; border-radius:50%; filter:blur(90px);
  background:rgba(37,99,235,.07); pointer-events:none; z-index:0; }

.faq__inner{ position:relative; z-index:1; margin:0 auto; max-width:1240px;
  display:grid; grid-template-columns:1fr; gap:clamp(36px,5vw,64px);
  padding:clamp(56px,9vw,112px) clamp(20px,5vw,80px); }

/* ── Left rail ── */
.faq__aside{ transition:opacity .8s .05s ease-out, transform .9s .05s cubic-bezier(.23,1,.32,1); }
.faq__eyebrow{ display:inline-flex; align-items:center; gap:9px; margin-bottom:20px;
  padding:7px 15px; border-radius:999px; border:1px solid rgba(37,99,235,.2);
  background:rgba(37,99,235,.05); font-size:.6rem; font-weight:700; letter-spacing:.2em;
  text-transform:uppercase; color:var(--accent); }
.faq__eyebrowDot{ width:6px; height:6px; border-radius:50%; background:var(--accent);
  animation:faqPulse 2.2s ease-in-out infinite; }
.faq__title{ margin:0; color:var(--navy); line-height:1.12; letter-spacing:-.025em;
  font-family:var(--font-playfair, Georgia, serif); font-weight:700;
  font-size:clamp(1.85rem,4.6vw,3rem); }
.faq__titleAccent{ font-style:italic;
  background:linear-gradient(100deg, var(--accent), #60A5FA);
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
.faq__lede{ margin:clamp(14px,2vw,20px) 0 0; max-width:380px; line-height:1.75;
  font-size:clamp(.82rem,1.5vw,.95rem); color:var(--muted); }

.faq__filters{ display:flex; flex-wrap:wrap; gap:8px; margin-top:clamp(22px,3vw,30px); }
.faq__chip{ padding:8px 15px; border-radius:999px; cursor:pointer; font-size:.74rem;
  font-weight:600; color:var(--muted); background:rgba(8,27,58,.04);
  border:1px solid rgba(8,27,58,.08); transition:all .25s ease; }
.faq__chip:hover{ color:var(--navy); border-color:rgba(8,27,58,.2); }
.faq__chip.is-on{ color:#fff; background:var(--navy); border-color:var(--navy);
  box-shadow:0 8px 20px -8px rgba(8,27,58,.5); }

.faq__contact{ display:flex; align-items:flex-start; gap:13px; margin-top:clamp(28px,4vw,40px);
  padding:18px 20px; border-radius:16px; border:1px solid var(--line);
  background:linear-gradient(135deg, rgba(37,99,235,.04), rgba(96,165,250,.02)); }
.faq__contactPulse{ position:relative; display:inline-flex; width:10px; height:10px; margin-top:4px; flex:0 0 auto; }
.faq__contactRing{ position:absolute; inset:0; border-radius:50%; background:#34D399; opacity:.7;
  animation:faqPing 1.8s cubic-bezier(0,0,.2,1) infinite; }
.faq__contactDot{ position:relative; width:10px; height:10px; border-radius:50%; background:#10B981; }
.faq__contactTitle{ margin:0 0 4px; font-size:.84rem; font-weight:600; color:var(--navy); }
.faq__contactLink{ display:inline-flex; align-items:center; gap:6px; text-decoration:none;
  font-size:.82rem; font-weight:600; color:var(--accent); transition:gap .25s ease; }
.faq__contactLink:hover{ gap:10px; }

/* ── Accordion ── */
.faq__list{ display:flex; flex-direction:column; gap:0;
  transition:opacity .8s .15s ease-out, transform .9s .15s cubic-bezier(.23,1,.32,1); }
.faq__item{ border-bottom:1px solid var(--line); transition:border-color .3s ease; }
.faq__item:first-child{ border-top:1px solid var(--line); }
.faq__item.is-open{ border-color:rgba(37,99,235,.25); }

.faq__q{ display:flex; align-items:center; gap:clamp(12px,2vw,20px); width:100%;
  text-align:left; cursor:pointer; background:none; border:none;
  padding:clamp(18px,2.6vw,26px) 4px; transition:padding-left .3s ease; }
.faq__q:hover{ padding-left:10px; }
.faq__num{ flex:0 0 auto; font-family:var(--font-playfair, Georgia, serif); font-weight:700;
  font-size:clamp(.8rem,1.4vw,1rem); color:rgba(8,27,58,.28); font-variant-numeric:tabular-nums;
  transition:color .3s ease; }
.faq__item.is-open .faq__num{ color:var(--accent); }
.faq__qText{ flex:1; font-family:var(--font-playfair, Georgia, serif); font-weight:700;
  font-size:clamp(.98rem,1.9vw,1.25rem); line-height:1.35; color:var(--navy);
  letter-spacing:-.01em; }

.faq__icon{ position:relative; flex:0 0 auto; width:34px; height:34px; border-radius:50%;
  display:grid; place-items:center; border:1px solid var(--line);
  transition:all .35s cubic-bezier(.23,1,.32,1); }
.faq__item.is-open .faq__icon{ background:var(--navy); border-color:var(--navy);
  transform:rotate(180deg); }
.faq__iconBar{ position:absolute; background:var(--navy); border-radius:2px;
  transition:all .35s cubic-bezier(.23,1,.32,1); }
.faq__iconBar--h{ width:13px; height:2px; }
.faq__iconBar--v{ width:2px; height:13px; }
.faq__item.is-open .faq__iconBar{ background:#fff; }
.faq__item.is-open .faq__iconBar--v{ height:2px; }

.faq__a{ overflow:hidden; height:0;
  transition:height .4s cubic-bezier(.4,0,.2,1); }
.faq__aInner{ padding:0 clamp(34px,5vw,52px) clamp(20px,2.6vw,26px) clamp(34px,5vw,52px); }
.faq__aInner p{ margin:0; line-height:1.75; color:var(--muted);
  font-size:clamp(.82rem,1.5vw,.95rem); max-width:640px; }

/* ── Animations ── */
@keyframes faqPulse{ 0%,100%{ opacity:.4; } 50%{ opacity:1; } }
@keyframes faqPing{ 75%,100%{ transform:scale(2.2); opacity:0; } }

/* ── Responsive ── */
@media (min-width:900px){
  .faq__inner{ grid-template-columns:0.85fr 1.15fr; align-items:start; }
  .faq__aside{ position:sticky; top:96px; }
}

@media (prefers-reduced-motion: reduce){
  .faq *{ animation:none !important; }
  .faq__a{ transition:none !important; }
}
`;