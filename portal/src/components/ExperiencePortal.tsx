import React, { useState, useEffect, useMemo } from "react";
import {
  filterSkillsByCategoryAndQuery,
  filterExperienceByTag,
  getLocalizedText,
  getCapabilitiesPillars,
} from "../utils/portalFilter.mjs";

const CATEGORY_LABELS: Record<string, { es: string; en: string }> = {
  all: { es: "Todo el Stack", en: "All Stack" },
  data_engineering: { es: "Data Engineering & ELT", en: "Data Engineering & ELT" },
  ml_ai: { es: "Machine Learning & Simulación", en: "Machine Learning & Simulation" },
  conversational_ai: { es: "Agentes IA & MCP", en: "AI Agents & MCP" },
  cloud_devops: { es: "Cloud AWS & Terraform IaC", en: "AWS Cloud & Terraform IaC" },
  languages: { es: "Lenguajes", en: "Languages" },
  databases: { es: "Warehousing & DBs", en: "Warehousing & DBs" },
  visualization: { es: "Executive BI", en: "Executive BI" },
};

const UI_TEXT = {
  es: {
    menuWork: "Proyectos",
    menuCapabilities: "Capacidades",
    menuExp: "Experiencia",
    menuStack: "Stack",
    menuCerts: "Credenciales",
    heroHeadline:
      "Científico de Datos & Ingeniero de IA diseñando pipelines escalables, modelos predictivos y sistemas autónomos en producción.",
    heroRoleTag: "Actualmente Científico de Datos Jr. & AI Developer en CIM DATA IA",
    ctaWork: "Explorar Proyectos",
    ctaResume: "Ver Hoja de Vida (PDF)",
    ctaCopyEmail: "Copiar Correo",
    ctaCopied: "¡Copiado al portapapeles!",
    workEyebrow: "SELECTED WORK // PROYECTOS DESTACADOS",
    workTitle: "Ingeniería de Datos, Modelos Predictivos & Agentes en Producción",
    capabilitiesEyebrow: "CAPABILITIES // QUÉ CONSTRUYO",
    capabilitiesTitle: "Estrategia Analítica, Arquitectura Cloud & Ejecución de Punta a Punta",
    expEyebrow: "EXPERIENCE // TRAYECTORIA PROFESIONAL",
    expTitle: "Impacto Técnico en Consultoría de IA, Banca e Industria",
    expFilterAll: "Todas las tecnologías",
    stackEyebrow: "TECHNICAL SYSTEM // MATRIZ DE HABILIDADES",
    stackTitle: "Herramientas, Lenguajes & Ecosistema en Producción",
    searchPlaceholder: "Buscar tecnología (ej. Terraform, Snowflake, MCP, Airflow, FastAPI, Monte Carlo)...",
    liveEyebrow: "OPEN SOURCE // GITHUB ACTIVITY",
    liveTitle: "Repositorios Recientes Sincronizados en Vivo",
    eduEyebrow: "EDUCATION & CREDENTIALS // FORMACIÓN",
    eduTitle: "Educación Superior & Certificaciones Verificables",
    verifyPlatzi: "Verificar perfil en Platzi",
    contactEyebrow: "NEXT STEP // CONTACTO DIRECTO",
    contactHeadline: "¿Construimos el próximo pipeline de datos, modelo predictivo o agente autónomo?",
    modalTitle: "Hoja de Vida — Santiago Montaña",
    closeModal: "Cerrar",
    inspectRepo: "Ver caso y código",
  },
  en: {
    menuWork: "Work",
    menuCapabilities: "Capabilities",
    menuExp: "Experience",
    menuStack: "Stack",
    menuCerts: "Credentials",
    heroHeadline:
      "Data Scientist & AI Engineer shaping scalable data pipelines, predictive models, and autonomous systems across cloud and enterprise.",
    heroRoleTag: "Currently Jr. Data Scientist & AI Developer at CIM DATA IA",
    ctaWork: "Explore Work",
    ctaResume: "Preview Resume (PDF)",
    ctaCopyEmail: "Copy Email",
    ctaCopied: "Copied to clipboard!",
    workEyebrow: "SELECTED WORK // CASE STUDIES",
    workTitle: "Production Data Pipelines, Predictive Models & Autonomous AI",
    capabilitiesEyebrow: "CAPABILITIES // WHAT I DO",
    capabilitiesTitle: "Analytical Strategy, Cloud Architecture & End-to-End Execution",
    expEyebrow: "EXPERIENCE // CAREER TRACK RECORD",
    expTitle: "Engineering Impact Across AI Consulting, Banking & Industry",
    expFilterAll: "All technologies",
    stackEyebrow: "TECHNICAL SYSTEM // SKILLS MATRIX",
    stackTitle: "Production Tools, Languages & Cloud Ecosystem",
    searchPlaceholder: "Search skill (e.g. Terraform, Snowflake, MCP, Airflow, FastAPI, Monte Carlo)...",
    liveEyebrow: "OPEN SOURCE // GITHUB ACTIVITY",
    liveTitle: "Live Synchronized GitHub Repositories",
    eduEyebrow: "EDUCATION & CREDENTIALS // BACKGROUND",
    eduTitle: "Academic Degrees & Verified Certifications",
    verifyPlatzi: "Verify credentials on Platzi",
    contactEyebrow: "NEXT STEP // GET IN TOUCH",
    contactHeadline: "Ready to build your next data pipeline, predictive model, or autonomous AI agent?",
    modalTitle: "Resume — Santiago Montaña",
    closeModal: "Close",
    inspectRepo: "Inspect case & code",
  },
};

function BlurRevealWords({
  text,
  className = "",
  baseDelay = 0,
}: {
  text: string;
  className?: string;
  baseDelay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, idx) => (
        <React.Fragment key={`${word}-${idx}`}>
          <span
            className="blur-word"
            style={{ animationDelay: `${baseDelay + idx * 42}ms` }}
          >
            {word}
          </span>{" "}
        </React.Fragment>
      ))}
    </span>
  );
}

function ProjectVisualCanvas({ index, category, tools }: { index: number; category: string; tools: string[] }) {
  const variants = [
    {
      bg: "radial-gradient(circle at 80% 20%, rgba(255, 217, 142, 0.22), transparent 55%), linear-gradient(145deg, #1b1917 0%, #111010 100%)",
      accent: "#ffd98e",
      label: "AUTONOMOUS MCP PIPELINE",
      metric: "LLM -> MCP -> Multi-Channel",
    },
    {
      bg: "radial-gradient(circle at 20% 80%, rgba(255, 217, 142, 0.18), transparent 55%), linear-gradient(145deg, #171717 0%, #0f0e0e 100%)",
      accent: "#fcfcfc",
      label: "PRODUCTION ML INFERENCE API",
      metric: "FastAPI · Pydantic · Serialized Model",
    },
    {
      bg: "radial-gradient(circle at 75% 75%, rgba(255, 217, 142, 0.24), transparent 60%), linear-gradient(135deg, #1c1a16 0%, #100f0f 100%)",
      accent: "#ffd98e",
      label: "MONTE CARLO STOCHASTIC ENGINE",
      metric: "10,000+ Simulated Paths · NLP Sentiment",
    },
    {
      bg: "radial-gradient(circle at 25% 25%, rgba(255, 217, 142, 0.19), transparent 55%), linear-gradient(145deg, #181716 0%, #0f0e0e 100%)",
      accent: "#fcfcfc",
      label: "LOW-LATENCY VOICE AI AGENT",
      metric: "ElevenLabs Stream · Python · REST",
    },
    {
      bg: "radial-gradient(circle at 80% 30%, rgba(255, 217, 142, 0.2), transparent 55%), linear-gradient(145deg, #191816 0%, #111010 100%)",
      accent: "#ffd98e",
      label: "SUPPLY CHAIN OPTIMIZATION",
      metric: "Carrier & Pricing Elasticity Model",
    },
    {
      bg: "radial-gradient(circle at 30% 70%, rgba(255, 217, 142, 0.18), transparent 55%), linear-gradient(145deg, #171615 0%, #0f0e0e 100%)",
      accent: "#fcfcfc",
      label: "ENSEMBLE CLASSIFICATION",
      metric: "Random Forest · Decision Trees · ROC-AUC",
    },
  ];
  const v = variants[index % variants.length];

  return (
    <div className="work-visual-canvas" style={{ background: v.bg }}>
      <div className="canvas-top-row">
        <span className="canvas-spec-label">{v.label}</span>
        <span className="canvas-index">0{index + 1}</span>
      </div>

      {/* Minimalist Architectural Node Diagram inside the Showcase Canvas */}
      <div className="canvas-diagram">
        <svg viewBox="0 0 420 120" className="canvas-svg" aria-hidden="true">
          <line x1="48" y1="60" x2="210" y2="34" stroke="rgba(255,217,142,0.32)" strokeWidth="1.2" />
          <line x1="48" y1="60" x2="210" y2="86" stroke="rgba(252,252,252,0.2)" strokeWidth="1.2" />
          <line x1="210" y1="34" x2="368" y2="60" stroke="rgba(255,217,142,0.38)" strokeWidth="1.2" />
          <line x1="210" y1="86" x2="368" y2="60" stroke="rgba(252,252,252,0.22)" strokeWidth="1.2" />

          <circle cx="48" cy="60" r="14" fill="#191919" stroke="#ffd98e" strokeWidth="1.5" />
          <circle cx="48" cy="60" r="4" fill="#ffd98e" />

          <rect x="160" y="18" width="100" height="32" rx="8" fill="#141313" stroke="rgba(255,217,142,0.45)" strokeWidth="1" />
          <text x="210" y="38" fill="#ffd98e" fontSize="9.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
            {tools[0] || "Python"}
          </text>

          <rect x="160" y="70" width="100" height="32" rx="8" fill="#141313" stroke="rgba(252,252,252,0.22)" strokeWidth="1" />
          <text x="210" y="90" fill="#fcfcfc" fontSize="9.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
            {tools[1] || "ML / Cloud"}
          </text>

          <circle cx="368" cy="60" r="16" fill="rgba(255,217,142,0.14)" stroke="#ffd98e" strokeWidth="1.5" />
          <circle cx="368" cy="60" r="5" fill="#fcfcfc" />
        </svg>
      </div>

      <div className="canvas-bottom-row">
        <span className="canvas-metric">{v.metric}</span>
        <span className="canvas-cat-pill">{category}</span>
      </div>
    </div>
  );
}

export default function ExperiencePortal({ profileData, baseUrl = "/santiloc-hub" }: { profileData: any; baseUrl?: string }) {
  const [lang, setLang] = useState<"es" | "en">("es");
  const [selectedExpTag, setSelectedExpTag] = useState<string>("ALL");
  const [activeSkillCat, setActiveSkillCat] = useState<string>("all");
  const [skillQuery, setSkillQuery] = useState<string>("");
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [cvModalOpen, setCvModalOpen] = useState<boolean>(false);
  const [cvModalLang, setCvModalLang] = useState<"es" | "en">("es");
  const [clockText, setClockText] = useState<string>("2026 · BOGOTÁ, CO");

  const cv = profileData.cv;
  const meta = cv.meta;
  const githubRepos = profileData.github_repos || [];
  const t = UI_TEXT[lang];
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });
      const timePart = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      });
      setClockText(`${datePart} · ${timePart}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const pillars = useMemo(() => getCapabilitiesPillars(lang), [lang]);

  const featuredExpTags = useMemo(() => {
    const set = new Set<string>();
    for (const job of cv.experience || []) {
      for (const tag of job.tags || []) {
        set.add(tag);
      }
    }
    return ["ALL", ...Array.from(set)];
  }, [cv.experience]);

  const filteredExperience = useMemo(
    () => filterExperienceByTag(cv.experience, selectedExpTag),
    [cv.experience, selectedExpTag]
  );

  const filteredSkills = useMemo(
    () => filterSkillsByCategoryAndQuery(cv.skills, activeSkillCat, skillQuery),
    [cv.skills, activeSkillCat, skillQuery]
  );

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(meta.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2400);
    }
  };

  const openResumeViewer = (initialLang: "es" | "en") => {
    setCvModalLang(initialLang);
    setCvModalOpen(true);
  };

  return (
    <div className="js-shell">
      {/* Subtle Warm Ambient Top Glow */}
      <div className="warm-spotlight" aria-hidden="true" />

      {/* JAKE SINCLAIR STYLE TOP HUD BAR */}
      <header className="hud-header">
        <div className="hud-inner">
          <div className="hud-left">
            <a href="#" className="hud-brand">
              <span className="hud-dot" />
              <span>Santiago Montaña</span>
            </a>
            <span className="hud-clock">{clockText}</span>
          </div>

          <nav className="hud-nav" aria-label="Primary Navigation">
            <a href="#work">{t.menuWork}</a>
            <a href="#capabilities">{t.menuCapabilities}</a>
            <a href="#experience">{t.menuExp}</a>
            <a href="#stack">{t.menuStack}</a>
            <a href="#credentials">{t.menuCerts}</a>
          </nav>

          <div className="hud-right">
            <div className="hud-lang-toggle" role="group" aria-label="Language switch">
              <button
                type="button"
                onClick={() => setLang("es")}
                className={lang === "es" ? "hud-lang-btn active" : "hud-lang-btn"}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={lang === "en" ? "hud-lang-btn active" : "hud-lang-btn"}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={() => openResumeViewer(lang)}
              className="hud-cv-btn"
            >
              <span>CV / PDF</span>
              <span className="arrow-ne">↗</span>
            </button>
          </div>
        </div>
      </header>

      <main className="editorial-main">
        {/* JAKE SINCLAIR EDITORIAL HERO */}
        <section className="js-hero">
          <div className="hero-avatar-row">
            <div className="squircle-avatar">
              <span className="squircle-initials">SM</span>
              <span className="squircle-status-dot" title={t.heroRoleTag} />
            </div>

            <div className="hero-identity-meta">
              <h2 className="hero-gold-name">
                <BlurRevealWords text={meta.name} baseDelay={40} />
              </h2>
              <p className="hero-role-caption">{t.heroRoleTag}</p>
            </div>
          </div>

          <h1 className="hero-statement" key={lang}>
            <BlurRevealWords text={t.heroHeadline} baseDelay={140} />
          </h1>

          <p className="hero-sublead">{getLocalizedText(cv, "summary", lang)}</p>

          <div className="hero-actions-bar">
            <a href="#work" className="btn-gold">
              <span>{t.ctaWork}</span>
              <span>↓</span>
            </a>

            <button
              type="button"
              onClick={() => openResumeViewer(lang)}
              className="btn-obsidian"
            >
              <span>{t.ctaResume}</span>
              <span>↗</span>
            </button>

            <a
              href={`${cleanBase}/CV_ES.pdf`}
              target="_blank"
              rel="noreferrer"
              className="btn-obsidian"
            >
              <span>CV (ES)</span>
              <span>↗</span>
            </a>

            <a
              href={`${cleanBase}/CV_EN.pdf`}
              target="_blank"
              rel="noreferrer"
              className="btn-obsidian"
            >
              <span>Resume (EN)</span>
              <span>↗</span>
            </a>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="btn-obsidian"
            >
              <span>{copiedEmail ? t.ctaCopied : t.ctaCopyEmail}</span>
            </button>
          </div>

          {/* Minimalist Metrics Strip */}
          <div className="js-metrics-row">
            {(meta.stats || []).map((st: any, idx: number) => (
              <div key={idx} className="js-metric-item">
                <span className="js-metric-val">{st.value}</span>
                <span className="js-metric-lbl">{getLocalizedText(st, "label", lang)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SELECTED WORK — LARGE FORMAT CASE STUDY CARDS */}
        <section id="work" className="js-section">
          <div className="js-section-head">
            <span className="js-eyebrow">{t.workEyebrow}</span>
            <h2 className="js-section-title">{t.workTitle}</h2>
          </div>

          <div className="work-showcase-grid">
            {(cv.projects || []).map((proj: any, idx: number) => (
              <article key={idx} className="work-showcase-card">
                <a
                  href={proj.repo || meta.github}
                  target="_blank"
                  rel="noreferrer"
                  className="work-card-link"
                >
                  <ProjectVisualCanvas
                    index={idx}
                    category={proj.category || "Data & AI"}
                    tools={proj.tools || []}
                  />

                  <div className="work-card-body">
                    <div className="work-meta-line">
                      <span className="work-year">2025 — 2026</span>
                      <span className="work-category">{proj.category || "Data & AI"}</span>
                    </div>

                    <div className="work-title-row">
                      <h3>{getLocalizedText(proj, "name", lang)}</h3>
                      <span className="work-arrow-circle">↗</span>
                    </div>

                    <p className="work-description">
                      {getLocalizedText(proj, "description", lang)}
                    </p>

                    <div className="work-tags">
                      {(proj.tools || []).map((tool: string) => (
                        <span key={tool} className="work-tag-pill">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* JAKE SINCLAIR 6-PILLAR CAPABILITIES SECTION */}
        <section id="capabilities" className="js-section">
          <div className="js-section-head">
            <span className="js-eyebrow">{t.capabilitiesEyebrow}</span>
            <h2 className="js-section-title">{t.capabilitiesTitle}</h2>
          </div>

          <div className="capabilities-grid">
            {pillars.map((pillar: any) => (
              <article key={pillar.number} className="capability-card">
                <div className="cap-top">
                  <span className="cap-number">{pillar.number}</span>
                  <h3 className="cap-title">{pillar.title}</h3>
                  <p className="cap-desc">{pillar.description}</p>
                </div>

                <div className="cap-tags">
                  {pillar.tags.map((tg: string) => (
                    <span key={tg} className="cap-tag">
                      {tg}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* EDITORIAL EXPERIENCE LEDGER */}
        <section id="experience" className="js-section">
          <div className="js-section-head">
            <span className="js-eyebrow">{t.expEyebrow}</span>
            <h2 className="js-section-title">{t.expTitle}</h2>
          </div>

          <div className="js-filter-bar">
            {featuredExpTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedExpTag(tag)}
                className={selectedExpTag === tag ? "js-filter-pill active" : "js-filter-pill"}
              >
                {tag === "ALL" ? t.expFilterAll : tag}
              </button>
            ))}
          </div>

          <div className="exp-ledger">
            {filteredExperience.map((job: any) => {
              const bullets = job[`bullets_${lang}`] || job.bullets_es || [];
              const period = lang === "en" && job.period_en ? job.period_en : job.period;
              return (
                <article
                  key={job.id || job.title_es}
                  className={job.current ? "exp-row current" : "exp-row"}
                >
                  <div className="exp-left-col">
                    <div className="exp-period">{period}</div>
                    <div className="exp-company-name">{job.company}</div>
                    <div className="exp-loc">{job.location}</div>
                    {job.current && <span className="exp-live-badge">● ACTIVE ROLE</span>}
                  </div>

                  <div className="exp-right-col">
                    <h3 className="exp-role-heading">{getLocalizedText(job, "title", lang)}</h3>
                    <div className="exp-domain-sub">{getLocalizedText(job, "domain", lang)}</div>

                    <ul className="exp-bullets">
                      {bullets.map((b: string, i: number) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>

                    <div className="exp-tags-wrap">
                      {(job.tags || []).map((tag: string) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSelectedExpTag(selectedExpTag === tag ? "ALL" : tag)}
                          className={selectedExpTag === tag ? "work-tag-pill active" : "work-tag-pill clickable"}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* INTERACTIVE TECHNICAL STACK MATRIX */}
        <section id="stack" className="js-section">
          <div className="js-section-head">
            <span className="js-eyebrow">{t.stackEyebrow}</span>
            <h2 className="js-section-title">{t.stackTitle}</h2>
          </div>

          <div className="stack-controls">
            <input
              type="search"
              value={skillQuery}
              onChange={(e) => setSkillQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="js-search-input"
            />

            <div className="js-filter-bar">
              {Object.keys(CATEGORY_LABELS).map((catKey) => (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveSkillCat(catKey)}
                  className={activeSkillCat === catKey ? "js-filter-pill active" : "js-filter-pill"}
                >
                  {CATEGORY_LABELS[catKey][lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="stack-bento-grid">
            {filteredSkills.map((group: any) => {
              const labelObj = CATEGORY_LABELS[group.category] || {
                es: group.category,
                en: group.category,
              };
              return (
                <div key={group.category} className="stack-bento-card">
                  <div className="stack-card-header">
                    <h3>{labelObj[lang]}</h3>
                    <span>{group.items.length}</span>
                  </div>
                  <div className="stack-items">
                    {group.items.map((item: string) => (
                      <span key={item} className="stack-chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* LIVE GITHUB ACTIVITY */}
        <section className="js-section">
          <div className="js-section-head">
            <span className="js-eyebrow">{t.liveEyebrow}</span>
            <h2 className="js-section-title">{t.liveTitle}</h2>
          </div>

          <div className="github-live-grid">
            {githubRepos.map((repo: any) => (
              <a
                key={repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="github-live-card"
              >
                <div className="gh-card-top">
                  <div className="gh-name-row">
                    <span className="gh-repo-name">{repo.name}</span>
                    <span className="gh-arrow">↗</span>
                  </div>
                  <p className="gh-repo-desc">{repo.description}</p>
                </div>
                <div className="gh-card-bottom">
                  <span className="gh-lang">{repo.language || "Python"}</span>
                  <span className="gh-date">{(repo.updated_at || "").slice(0, 10)}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* EDUCATION & VERIFIED CERTIFICATIONS */}
        <section id="credentials" className="js-section">
          <div className="js-section-head">
            <span className="js-eyebrow">{t.eduEyebrow}</span>
            <h2 className="js-section-title">{t.eduTitle}</h2>
          </div>

          <div className="credentials-layout">
            <div className="degrees-col">
              {(cv.education || []).map((ed: any, idx: number) => (
                <div key={idx} className="degree-card">
                  <span className="degree-badge">
                    {lang === "en" && ed.period_en ? ed.period_en : ed.period}
                  </span>
                  <h3>{getLocalizedText(ed, "degree", lang)}</h3>
                  <p>{ed.institution}</p>
                </div>
              ))}
            </div>

            <div className="certs-col">
              <div className="certs-top-bar">
                <span>Platzi Verified Credentials (2024 — 2025)</span>
                <a href={meta.platzi} target="_blank" rel="noreferrer" className="platzi-gold-link">
                  {t.verifyPlatzi} ↗
                </a>
              </div>
              <div className="certs-list-grid">
                {(cv.courses || []).map((c: any, idx: number) => (
                  <div key={idx} className="cert-item-card">
                    <span className="cert-title">{c.name}</span>
                    <span className="cert-date">{c.date || "2025"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* JAKE SINCLAIR CLOSING CTA BANNER */}
        <section className="js-closing-cta">
          <span className="js-eyebrow">{t.contactEyebrow}</span>
          <h2>{t.contactHeadline}</h2>
          <div className="closing-links">
            <a href={`mailto:${meta.email}`} className="btn-gold">
              {meta.email} ↗
            </a>
            <a href={meta.linkedin} target="_blank" rel="noreferrer" className="btn-obsidian">
              LinkedIn ↗
            </a>
            <a href={meta.github} target="_blank" rel="noreferrer" className="btn-obsidian">
              GitHub (@santiloc-hub) ↗
            </a>
          </div>
        </section>
      </main>

      {/* EMBEDDED PDF RESUME VIEWER MODAL */}
      {cvModalOpen && (
        <div className="cv-modal-backdrop" onClick={() => setCvModalOpen(false)}>
          <div className="cv-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="cv-modal-header">
              <span className="cv-modal-title">{t.modalTitle}</span>
              <div className="cv-modal-actions">
                <button
                  type="button"
                  onClick={() => setCvModalLang("es")}
                  className={cvModalLang === "es" ? "hud-lang-btn active" : "hud-lang-btn"}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => setCvModalLang("en")}
                  className={cvModalLang === "en" ? "hud-lang-btn active" : "hud-lang-btn"}
                >
                  EN
                </button>
                <a
                  href={`${cleanBase}/CV_${cvModalLang.toUpperCase()}.pdf`}
                  download
                  className="btn-gold-sm"
                >
                  Download PDF ↗
                </a>
                <button
                  type="button"
                  onClick={() => setCvModalOpen(false)}
                  className="btn-close-modal"
                >
                  {t.closeModal} ✕
                </button>
              </div>
            </div>
            <iframe
              src={`${cleanBase}/CV_${cvModalLang.toUpperCase()}.pdf`}
              title="Santiago Montaña Resume PDF"
              className="cv-modal-iframe"
            />
          </div>
        </div>
      )}

      <footer className="js-footer">
        <div className="js-footer-inner">
          <span>© {new Date().getFullYear()} {meta.name}</span>
          <span>Auto-synced from cv_data.yaml + GitHub API</span>
          <span>{clockText}</span>
        </div>
      </footer>
    </div>
  );
}
