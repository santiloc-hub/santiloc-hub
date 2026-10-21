import React, { useState, useMemo } from "react";
import {
  filterSkillsByCategoryAndQuery,
  filterExperienceByTag,
  getLocalizedText,
  getArchitectureBlueprints,
} from "../utils/portalFilter.mjs";

const CATEGORY_LABELS: Record<string, { es: string; en: string; accent: string }> = {
  all: { es: "Todos los Dominios", en: "All Domains", accent: "#22d3ee" },
  data_engineering: { es: "Data Engineering & Pipelines", en: "Data Engineering & Pipelines", accent: "#38bdf8" },
  ml_ai: { es: "Data Science & Machine Learning", en: "Data Science & Machine Learning", accent: "#34d399" },
  conversational_ai: { es: "Agentes IA & Protocolo MCP", en: "AI Agents & MCP Protocol", accent: "#c084fc" },
  cloud_devops: { es: "Cloud AWS, Terraform & MLOps", en: "AWS Cloud, Terraform & MLOps", accent: "#fbbf24" },
  languages: { es: "Lenguajes & Ecosistema", en: "Languages & Ecosystem", accent: "#60a5fa" },
  databases: { es: "Data Warehousing & Bases de Datos", en: "Data Warehousing & Databases", accent: "#2dd4bf" },
  visualization: { es: "BI Ejecutivo & Storytelling", en: "Executive BI & Storytelling", accent: "#f472b6" },
};

const LANG_COLORS: Record<string, string> = {
  Python: "#38bdf8",
  "Jupyter Notebook": "#fb923c",
  TypeScript: "#60a5fa",
  JavaScript: "#facc15",
  HTML: "#f87171",
};

const UI_TEXT = {
  es: {
    navExp: "Experiencia",
    navSkills: "Arquitectura & Stack",
    navProjects: "Proyectos",
    navRepos: "GitHub Live",
    navEdu: "Formación",
    activeBadge: "DISPONIBLE · CIENTÍFICO DE DATOS JR. & AI ENGINEER @ CIM DATA IA",
    heroEyebrow: "INGENIERÍA DE DATOS · MACHINE LEARNING · AGENTES MCP · CLOUD IaC",
    openCvModal: "Explorar CV en Pantalla",
    downloadEs: "Descargar CV (ES)",
    downloadEn: "Resume (EN)",
    copyEmail: "Copiar Correo",
    copiedEmail: "¡Correo copiado!",
    telemetryTitle: "ARQUITECTURA EN PRODUCCIÓN",
    expEyebrow: "TRAYECTORIA VERIFICADA",
    expTitle: "Experiencia Profesional e Impacto Técnico",
    expSubtitle: "Selecciona cualquier tecnología del stack para filtrar los cargos y logros donde fue implementada en producción.",
    allTags: "Todas las tecnologías",
    skillsEyebrow: "MATRIZ TÉCNICA",
    skillsTitle: "Ecosistema de Ingeniería, Ciencia de Datos e IA",
    skillsSubtitle: "Filtra por capa arquitectónica o busca herramientas específicas de mi stack diario.",
    searchPlaceholder: "Filtrar tecnología (ej. Terraform, Snowflake, MCP, Airflow, FastAPI, Monte Carlo)...",
    projectsEyebrow: "CASOS DE ESTUDIO & CÓDIGO",
    projectsTitle: "Proyectos Destacados de Extremo a Extremo",
    projectsSubtitle: "Desde la simulación estadística y el entrenamiento de modelos hasta APIs en FastAPI y agentes autónomos.",
    viewRepo: "Inspeccionar código",
    liveReposEyebrow: "SINCRONIZACIÓN CONTINUA",
    liveReposTitle: "Actividad Reciente en GitHub",
    liveReposSubtitle: "Conectado automáticamente a la API oficial de GitHub (@santiloc-hub).",
    eduEyebrow: "CREDENCIALES ACADÉMICAS Y TÉCNICAS",
    eduTitle: "Educación Superior",
    certsTitle: "Certificaciones Verificadas",
    verifyPlatzi: "Verificar credenciales en Platzi",
    modalTitle: "Visor de Hoja de Vida (ATS Ready)",
    closeModal: "Cerrar",
    autoSyncLabel: "Ecosistema compilado con Astro + React y sincronizado desde cv_data.yaml + GitHub API",
  },
  en: {
    navExp: "Experience",
    navSkills: "Architecture & Stack",
    navProjects: "Projects",
    navRepos: "GitHub Live",
    navEdu: "Education",
    activeBadge: "AVAILABLE · JR. DATA SCIENTIST & AI ENGINEER @ CIM DATA IA",
    heroEyebrow: "DATA ENGINEERING · MACHINE LEARNING · MCP AGENTS · CLOUD IaC",
    openCvModal: "Preview Resume",
    downloadEs: "CV Español (PDF)",
    downloadEn: "Download Resume (EN)",
    copyEmail: "Copy Email",
    copiedEmail: "Email copied!",
    telemetryTitle: "PRODUCTION ARCHITECTURE",
    expEyebrow: "VERIFIED TRACK RECORD",
    expTitle: "Professional Experience & Engineering Impact",
    expSubtitle: "Click any technology pill to filter the roles and production milestones where it was applied.",
    allTags: "All technologies",
    skillsEyebrow: "TECHNICAL MATRIX",
    skillsTitle: "Data Engineering, ML & AI Stack",
    skillsSubtitle: "Filter by architectural layer or search for a specific tool in my daily workflow.",
    searchPlaceholder: "Search technology (e.g. Terraform, Snowflake, MCP, Airflow, FastAPI, Monte Carlo)...",
    projectsEyebrow: "CASE STUDIES & CODE",
    projectsTitle: "End-to-End Featured Projects",
    projectsSubtitle: "From statistical simulation and model training to FastAPI microservices and autonomous agents.",
    viewRepo: "Inspect repository",
    liveReposEyebrow: "CONTINUOUS SYNC",
    liveReposTitle: "Live GitHub Activity & Repositories",
    liveReposSubtitle: "Automatically synchronized from the official GitHub API (@santiloc-hub).",
    eduEyebrow: "ACADEMIC & TECHNICAL CREDENTIALS",
    eduTitle: "Higher Education",
    certsTitle: "Verified Certifications",
    verifyPlatzi: "Verify credentials on Platzi",
    modalTitle: "Interactive Resume Viewer (ATS Ready)",
    closeModal: "Close",
    autoSyncLabel: "Ecosystem built with Astro + React and synced from cv_data.yaml + GitHub API",
  },
};

function IconArrowUpRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconDocument() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function ExperiencePortal({ profileData, baseUrl = "/santiloc-hub" }: { profileData: any; baseUrl?: string }) {
  const [lang, setLang] = useState<"es" | "en">("es");
  const [activeBlueprint, setActiveBlueprint] = useState<string>("pipelines");
  const [selectedExpTag, setSelectedExpTag] = useState<string>("ALL");
  const [activeSkillCat, setActiveSkillCat] = useState<string>("all");
  const [skillQuery, setSkillQuery] = useState<string>("");
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [cvModalOpen, setCvModalOpen] = useState<boolean>(false);
  const [cvModalLang, setCvModalLang] = useState<"es" | "en">("es");

  const cv = profileData.cv;
  const meta = cv.meta;
  const githubRepos = profileData.github_repos || [];
  const t = UI_TEXT[lang];
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  const blueprints = useMemo(() => getArchitectureBlueprints(lang), [lang]);
  const currentBlueprint = useMemo(
    () => blueprints.find((b) => b.id === activeBlueprint) || blueprints[0],
    [blueprints, activeBlueprint]
  );

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
    <div className="portal-shell">
      {/* Ambient background spotlights */}
      <div className="ambient-orb orb-cyan" aria-hidden="true" />
      <div className="ambient-orb orb-emerald" aria-hidden="true" />
      <div className="ambient-grid" aria-hidden="true" />

      {/* Top Glass Navigation Bar */}
      <header className="top-nav">
        <div className="nav-inner">
          <a href="#" className="brand">
            <span className="brand-mark">SM</span>
            <div className="brand-text">
              <span className="brand-name">{meta.name}</span>
              <span className="brand-sub">DATA &amp; AI HUB</span>
            </div>
          </a>

          <nav className="nav-links">
            <a href="#experience">{t.navExp}</a>
            <a href="#skills">{t.navSkills}</a>
            <a href="#projects">{t.navProjects}</a>
            <a href="#github-live">{t.navRepos}</a>
            <a href="#education">{t.navEdu}</a>
          </nav>

          <div className="nav-actions">
            <div className="lang-switch" role="group" aria-label="Language selector">
              <button
                type="button"
                className={lang === "es" ? "lang-btn active" : "lang-btn"}
                onClick={() => setLang("es")}
              >
                ES
              </button>
              <button
                type="button"
                className={lang === "en" ? "lang-btn active" : "lang-btn"}
                onClick={() => setLang("en")}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={() => openResumeViewer(lang)}
              className="btn-nav-resume"
            >
              <IconDocument />
              <span>CV / PDF</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* ASYMMETRIC 2-COLUMN PREMIUM HERO */}
        <section className="hero-grid">
          <div className="hero-left">
            <div className="status-pill">
              <span className="pulse-ring" />
              <span className="pulse-dot" />
              <span>{t.activeBadge}</span>
            </div>

            <div className="hero-eyebrow">{t.heroEyebrow}</div>
            <h1 className="hero-title">{meta.name}</h1>
            <p className="hero-tagline">{getLocalizedText(meta, "tagline", lang)}</p>
            <p className="hero-summary">{getLocalizedText(cv, "summary", lang)}</p>

            <div className="hero-cta-group">
              <button
                type="button"
                onClick={() => openResumeViewer(lang)}
                className="btn-primary-glow"
              >
                <IconDocument />
                <span>{t.openCvModal}</span>
              </button>

              <a
                href={`${cleanBase}/CV_ES.pdf`}
                target="_blank"
                rel="noreferrer"
                className="btn-glass"
              >
                <span>{t.downloadEs}</span>
                <IconArrowUpRight />
              </a>

              <a
                href={`${cleanBase}/CV_EN.pdf`}
                target="_blank"
                rel="noreferrer"
                className="btn-glass"
              >
                <span>{t.downloadEn}</span>
                <IconArrowUpRight />
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="btn-glass"
              >
                <span>{copiedEmail ? t.copiedEmail : t.copyEmail}</span>
              </button>
            </div>

            <div className="hero-social-strip">
              <a href={meta.github} target="_blank" rel="noreferrer" className="social-link">
                <span>github.com/santiloc-hub</span>
                <IconArrowUpRight />
              </a>
              <span className="sep">·</span>
              <a href={meta.linkedin} target="_blank" rel="noreferrer" className="social-link">
                <span>linkedin.com/in/santiago-montaña</span>
                <IconArrowUpRight />
              </a>
              <span className="sep">·</span>
              <span className="location-tag">{getLocalizedText(meta, "location", lang)}</span>
            </div>
          </div>

          {/* Right Column: Interactive Architecture & Telemetry Console */}
          <div className="hero-right">
            <div className="telemetry-console">
              <div className="console-topbar">
                <div className="window-dots">
                  <span className="dot red" />
                  <span className="dot amber" />
                  <span className="dot green" />
                </div>
                <span className="console-title">{t.telemetryTitle}</span>
                <span className="console-live-tag">● LIVE STACK</span>
              </div>

              {/* Interactive Blueprint Tabs */}
              <div className="console-tabs" role="tablist">
                {blueprints.map((bp) => (
                  <button
                    key={bp.id}
                    type="button"
                    role="tab"
                    aria-selected={activeBlueprint === bp.id}
                    onClick={() => setActiveBlueprint(bp.id)}
                    className={activeBlueprint === bp.id ? "console-tab active" : "console-tab"}
                  >
                    {bp.label}
                  </button>
                ))}
              </div>

              <div className="console-body">
                <div className="blueprint-subhead">
                  <span className="bp-status">{currentBlueprint.status}</span>
                  <span className="bp-badge">{currentBlueprint.badge}</span>
                </div>

                <div className="blueprint-nodes">
                  {currentBlueprint.nodes.map((node: any) => (
                    <div key={node.step} className="bp-node-card">
                      <div className="bp-step">{node.step}</div>
                      <div className="bp-node-info">
                        <div className="bp-node-title">{node.title}</div>
                        <div className="bp-node-tech">{node.tech}</div>
                      </div>
                      <div className="bp-node-metric">{node.metric}</div>
                    </div>
                  ))}
                </div>

                <pre className="console-code">
                  <code>{currentBlueprint.codeSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO METRICS STRIP */}
        <section className="bento-stats-strip">
          {(meta.stats || []).map((st: any, idx: number) => (
            <div key={idx} className="bento-stat-card">
              <div className="bento-stat-top">
                <span className="bento-stat-index">0{idx + 1}</span>
                <span className="bento-stat-dot" />
              </div>
              <div className="bento-stat-value">{st.value}</div>
              <div className="bento-stat-label">{getLocalizedText(st, "label", lang)}</div>
            </div>
          ))}
        </section>

        {/* EXPERIENCE TIMELINE SECTION */}
        <section id="experience" className="section-block">
          <div className="section-heading">
            <span className="section-eyebrow">{t.expEyebrow}</span>
            <h2>{t.expTitle}</h2>
            <p>{t.expSubtitle}</p>
          </div>

          <div className="filter-pills">
            {featuredExpTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedExpTag(tag)}
                className={selectedExpTag === tag ? "pill-btn active" : "pill-btn"}
              >
                {tag === "ALL" ? t.allTags : tag}
              </button>
            ))}
          </div>

          <div className="timeline-track">
            {filteredExperience.map((job: any) => {
              const bullets = job[`bullets_${lang}`] || job.bullets_es || [];
              const period = lang === "en" && job.period_en ? job.period_en : job.period;
              return (
                <article
                  key={job.id || job.title_es}
                  className={job.current ? "exp-card current" : "exp-card"}
                >
                  <div className="exp-timeline-marker">
                    <span className="marker-core" />
                  </div>

                  <div className="exp-card-header">
                    <div>
                      <div className="exp-title-row">
                        <h3>{getLocalizedText(job, "title", lang)}</h3>
                        {job.current && <span className="active-role-badge">CURRENT ROLE</span>}
                      </div>
                      <div className="exp-company-row">
                        <span className="exp-company">{job.company}</span>
                        <span className="sep">·</span>
                        <span className="exp-location">{job.location}</span>
                      </div>
                    </div>
                    <span className="exp-period-badge">{period}</span>
                  </div>

                  <div className="exp-domain-banner">
                    {getLocalizedText(job, "domain", lang)}
                  </div>

                  <ul className="exp-bullet-list">
                    {bullets.map((b: string, i: number) => (
                      <li key={i}>
                        <span className="bullet-icon">
                          <IconCheck />
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="exp-tag-row">
                    {(job.tags || []).map((tag: string) => (
                      <button
                        key={tag}
                        type="button"
                        className={selectedExpTag === tag ? "tech-chip active" : "tech-chip"}
                        onClick={() => setSelectedExpTag(selectedExpTag === tag ? "ALL" : tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* INTERACTIVE SKILLS BENTO MATRIX */}
        <section id="skills" className="section-block">
          <div className="section-heading">
            <span className="section-eyebrow">{t.skillsEyebrow}</span>
            <h2>{t.skillsTitle}</h2>
            <p>{t.skillsSubtitle}</p>
          </div>

          <div className="skills-toolbar">
            <div className="search-box">
              <IconSearch />
              <input
                type="search"
                value={skillQuery}
                onChange={(e) => setSkillQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="skill-search-input"
              />
            </div>

            <div className="filter-pills">
              {Object.keys(CATEGORY_LABELS).map((catKey) => {
                const info = CATEGORY_LABELS[catKey];
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setActiveSkillCat(catKey)}
                    className={activeSkillCat === catKey ? "pill-btn active" : "pill-btn"}
                  >
                    {info[lang]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bento-skills-grid">
            {filteredSkills.map((group: any) => {
              const catMeta = CATEGORY_LABELS[group.category] || {
                es: group.category,
                en: group.category,
                accent: "#38bdf8",
              };
              return (
                <div key={group.category} className="bento-skill-card">
                  <div className="skill-card-head">
                    <span
                      className="skill-accent-bar"
                      style={{ backgroundColor: catMeta.accent }}
                    />
                    <h3>{catMeta[lang]}</h3>
                    <span className="skill-count">{group.items.length}</span>
                  </div>
                  <div className="skill-items-wrap">
                    {group.items.map((skill: string) => (
                      <span key={skill} className="skill-pill">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURED CASE STUDIES & PROJECTS */}
        <section id="projects" className="section-block">
          <div className="section-heading">
            <span className="section-eyebrow">{t.projectsEyebrow}</span>
            <h2>{t.projectsTitle}</h2>
            <p>{t.projectsSubtitle}</p>
          </div>

          <div className="bento-projects-grid">
            {(cv.projects || []).map((proj: any, idx: number) => (
              <article key={idx} className="bento-project-card">
                <div className="project-card-top">
                  <div className="project-meta-row">
                    <span className="project-category-chip">{proj.category || "Data & AI"}</span>
                    <span className="project-index">0{idx + 1}</span>
                  </div>
                  <h3>{getLocalizedText(proj, "name", lang)}</h3>
                  <p>{getLocalizedText(proj, "description", lang)}</p>
                </div>

                <div className="project-card-bottom">
                  <div className="project-tools">
                    {(proj.tools || []).map((tool: string) => (
                      <span key={tool} className="tech-chip static">
                        {tool}
                      </span>
                    ))}
                  </div>
                  {proj.repo && (
                    <a
                      href={proj.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="project-action-link"
                    >
                      <span>{t.viewRepo}</span>
                      <IconArrowUpRight />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* LIVE GITHUB REPOSITORIES */}
        <section id="github-live" className="section-block">
          <div className="section-heading">
            <span className="section-eyebrow">{t.liveReposEyebrow}</span>
            <h2>{t.liveReposTitle}</h2>
            <p>{t.liveReposSubtitle}</p>
          </div>

          <div className="bento-repos-grid">
            {githubRepos.map((repo: any) => {
              const langName = repo.language || "Python";
              const dotColor = LANG_COLORS[langName] || "#38bdf8";
              return (
                <a
                  key={repo.name}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bento-repo-card"
                >
                  <div>
                    <div className="repo-head">
                      <span className="repo-name">{repo.name}</span>
                      <span className="repo-arrow">
                        <IconArrowUpRight />
                      </span>
                    </div>
                    <p className="repo-desc">{repo.description}</p>
                  </div>

                  <div className="repo-foot">
                    <span className="repo-lang-badge">
                      <span
                        className="lang-color-dot"
                        style={{ backgroundColor: dotColor }}
                      />
                      {langName}
                    </span>
                    <span className="repo-date">{(repo.updated_at || "").slice(0, 10)}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* ACADEMIC EDUCATION & VERIFIED CERTIFICATIONS */}
        <section id="education" className="section-block">
          <div className="section-heading">
            <span className="section-eyebrow">{t.eduEyebrow}</span>
            <h2>{t.eduTitle} &amp; {t.certsTitle}</h2>
          </div>

          <div className="edu-certs-bento">
            <div className="edu-panel">
              <h3 className="subpanel-title">{t.eduTitle}</h3>
              <div className="edu-list">
                {(cv.education || []).map((ed: any, idx: number) => (
                  <div key={idx} className="edu-glass-card">
                    <span className="edu-type-tag">
                      {lang === "en" && ed.period_en ? ed.period_en : ed.period}
                    </span>
                    <h4>{getLocalizedText(ed, "degree", lang)}</h4>
                    <p>{ed.institution}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="certs-panel">
              <div className="certs-header-row">
                <h3 className="subpanel-title">{t.certsTitle}</h3>
                <a
                  href={meta.platzi}
                  target="_blank"
                  rel="noreferrer"
                  className="platzi-verify-btn"
                >
                  <span>{t.verifyPlatzi}</span>
                  <IconArrowUpRight />
                </a>
              </div>

              <div className="certs-bento-grid">
                {(cv.courses || []).map((course: any, idx: number) => (
                  <div key={idx} className="cert-glass-card">
                    <div className="cert-name">{course.name}</div>
                    <div className="cert-meta">
                      <span className="cert-platform">{course.platform}</span>
                      {course.date && <span>· {course.date}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* INTERACTIVE PDF RESUME MODAL */}
      {cvModalOpen && (
        <div className="cv-modal-backdrop" onClick={() => setCvModalOpen(false)}>
          <div className="cv-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="cv-modal-header">
              <div className="cv-modal-title-group">
                <IconDocument />
                <span>{t.modalTitle}</span>
              </div>

              <div className="cv-modal-controls">
                <button
                  type="button"
                  className={cvModalLang === "es" ? "lang-btn active" : "lang-btn"}
                  onClick={() => setCvModalLang("es")}
                >
                  Español (ES)
                </button>
                <button
                  type="button"
                  className={cvModalLang === "en" ? "lang-btn active" : "lang-btn"}
                  onClick={() => setCvModalLang("en")}
                >
                  English (EN)
                </button>
                <a
                  href={`${cleanBase}/CV_${cvModalLang.toUpperCase()}.pdf`}
                  download
                  className="btn-modal-download"
                >
                  Download PDF ↗
                </a>
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setCvModalOpen(false)}
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

      <footer className="portal-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-mark sm">SM</span>
            <span>{meta.name}</span>
          </div>
          <p className="footer-sync">{t.autoSyncLabel}</p>
          <a href={`mailto:${meta.email}`} className="footer-mail">
            {meta.email}
          </a>
        </div>
      </footer>
    </div>
  );
}
