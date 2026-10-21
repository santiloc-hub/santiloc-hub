import React, { useState, useMemo } from "react";
import {
  filterSkillsByCategoryAndQuery,
  filterExperienceByTag,
  getLocalizedText,
} from "../utils/portalFilter.mjs";

const CATEGORY_LABELS: Record<string, { es: string; en: string; icon: string }> = {
  all: { es: "Todas las Áreas", en: "All Domains", icon: "⚡" },
  data_engineering: { es: "Ingeniería de Datos & Pipelines", en: "Data Engineering & Pipelines", icon: "🛢️" },
  ml_ai: { es: "Ciencia de Datos & ML", en: "Data Science & ML", icon: "🧠" },
  conversational_ai: { es: "IA Conversacional & Agentes MCP", en: "Conversational AI & MCP Agents", icon: "🤖" },
  cloud_devops: { es: "Cloud, Terraform (IaC) & DevOps", en: "Cloud, Terraform (IaC) & DevOps", icon: "☁️" },
  languages: { es: "Lenguajes de Programación", en: "Programming Languages", icon: "💻" },
  databases: { es: "Bases de Datos & Warehousing", en: "Databases & Warehousing", icon: "🗄️" },
  visualization: { es: "Visualización & BI", en: "Visualization & BI", icon: "📊" },
};

const UI_TEXT = {
  es: {
    navExp: "Experiencia",
    navSkills: "Habilidades",
    navProjects: "Proyectos",
    navRepos: "GitHub En Vivo",
    navEdu: "Educación & Certs",
    activeBadge: "ACTIVO · CIENTÍFICO DE DATOS JR. & AI DEVELOPER @ CIM DATA IA",
    downloadEs: "Descargar CV (ES)",
    downloadEn: "Download Resume (EN)",
    expTitle: "Trayectoria Profesional",
    expSubtitle: "Filtra mi experiencia por tecnología o explora cada etapa en detalle.",
    allTags: "Todas las tecnologías",
    skillsTitle: "Matriz Interactiva de Habilidades",
    skillsSubtitle: "Explora mi stack técnico por dominio de arquitectura o busca una herramienta específica.",
    searchPlaceholder: "Buscar tecnología (ej. Terraform, Snowflake, MCP, Airflow, FastAPI)...",
    projectsTitle: "Proyectos Destacados de Datos, ML e IA",
    projectsSubtitle: "Soluciones de extremo a extremo desde el modelado y simulación hasta el despliegue en producción.",
    viewRepo: "Ver Repositorio en GitHub ↗",
    liveReposTitle: "Actividad y Repositorios Recientes en GitHub",
    liveReposSubtitle: "Sincronizado automáticamente con la API de GitHub (@santiloc-hub).",
    eduTitle: "Educación Académica",
    certsTitle: "Certificaciones Verificadas",
    verifyPlatzi: "Verificar credenciales en Platzi ↗",
    autoSyncLabel: "Portal auto-sincronizado desde cv_data.yaml + GitHub API",
  },
  en: {
    navExp: "Experience",
    navSkills: "Skills Matrix",
    navProjects: "Projects",
    navRepos: "Live GitHub",
    navEdu: "Education & Certs",
    activeBadge: "ACTIVE · JR. DATA SCIENTIST & AI DEVELOPER @ CIM DATA IA",
    downloadEs: "Download CV (ES)",
    downloadEn: "Download Resume (EN)",
    expTitle: "Professional Experience Timeline",
    expSubtitle: "Filter my career milestones by technology or inspect each role in detail.",
    allTags: "All Technologies",
    skillsTitle: "Interactive Technical Skills Matrix",
    skillsSubtitle: "Filter my stack by engineering domain or search for a specific tool.",
    searchPlaceholder: "Search skill (e.g. Terraform, Snowflake, MCP, Airflow, FastAPI)...",
    projectsTitle: "Featured Data, ML & AI Projects",
    projectsSubtitle: "End-to-end solutions from statistical modeling and simulation to production deployment.",
    viewRepo: "View Repository on GitHub ↗",
    liveReposTitle: "Live GitHub Repositories & Recent Activity",
    liveReposSubtitle: "Automatically synchronized from the GitHub API (@santiloc-hub).",
    eduTitle: "Academic Education",
    certsTitle: "Verified Certifications",
    verifyPlatzi: "Verify credentials on Platzi ↗",
    autoSyncLabel: "Auto-synced portal powered by cv_data.yaml + GitHub API",
  },
};

export default function ExperiencePortal({ profileData, baseUrl = "/santiloc-hub" }: { profileData: any; baseUrl?: string }) {
  const [lang, setLang] = useState<"es" | "en">("es");
  const [selectedExpTag, setSelectedExpTag] = useState<string>("ALL");
  const [activeSkillCat, setActiveSkillCat] = useState<string>("all");
  const [skillQuery, setSkillQuery] = useState<string>("");

  const cv = profileData.cv;
  const meta = cv.meta;
  const githubRepos = profileData.github_repos || [];
  const t = UI_TEXT[lang];
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

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

  return (
    <div className="portal-shell">
      {/* Top Sticky Navbar */}
      <header className="top-nav">
        <div className="nav-inner">
          <a href="#" className="brand">
            <span className="brand-dot" />
            <span className="brand-name">{meta.name}</span>
            <span className="brand-tag">HUB</span>
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
                🇨🇴 ES
              </button>
              <button
                type="button"
                className={lang === "en" ? "lang-btn active" : "lang-btn"}
                onClick={() => setLang("en")}
              >
                🇬🇧 EN
              </button>
            </div>
            <a href={`${cleanBase}/CV_ES.pdf`} target="_blank" rel="noreferrer" className="btn-cv-sm">
              PDF (ES)
            </a>
            <a href={`${cleanBase}/CV_EN.pdf`} target="_blank" rel="noreferrer" className="btn-cv-sm secondary">
              PDF (EN)
            </a>
          </div>
        </div>
      </header>

      <main className="container">
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="status-pill">
            <span className="pulse-dot" />
            <span>{t.activeBadge}</span>
          </div>

          <h1 className="hero-title">{meta.name}</h1>
          <p className="hero-tagline">{getLocalizedText(meta, "tagline", lang)}</p>
          <p className="hero-summary">{getLocalizedText(cv, "summary", lang)}</p>

          <div className="hero-cta-row">
            <a href={`${cleanBase}/CV_ES.pdf`} target="_blank" rel="noreferrer" className="btn-primary">
              📄 {t.downloadEs}
            </a>
            <a href={`${cleanBase}/CV_EN.pdf`} target="_blank" rel="noreferrer" className="btn-secondary">
              📄 {t.downloadEn}
            </a>
            <a href={meta.github} target="_blank" rel="noreferrer" className="btn-ghost">
              🐙 GitHub (@santiloc-hub)
            </a>
            <a href={meta.linkedin} target="_blank" rel="noreferrer" className="btn-ghost">
              💼 LinkedIn
            </a>
          </div>

          {/* Dynamic Cover Banner Showcase */}
          <div className="banner-preview-wrapper">
            <img
              src={`${cleanBase}/banner.svg`}
              alt="Santiago Montaña Dynamic Cover Banner"
              className="banner-svg-img"
            />
          </div>

          {/* Key Stats Grid */}
          <div className="stats-grid">
            {(meta.stats || []).map((st: any, idx: number) => (
              <div key={idx} className="stat-card">
                <div className="stat-value">{st.value}</div>
                <div className="stat-label">{getLocalizedText(st, "label", lang)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* EXPERIENCE TIMELINE SECTION */}
        <section id="experience" className="section-block">
          <div className="section-header">
            <h2>💼 {t.expTitle}</h2>
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

          <div className="timeline">
            {filteredExperience.map((job: any) => {
              const bullets = job[`bullets_${lang}`] || job.bullets_es || [];
              const period = lang === "en" && job.period_en ? job.period_en : job.period;
              return (
                <article key={job.id || job.title_es} className={job.current ? "timeline-card current" : "timeline-card"}>
                  <div className="timeline-dot" />
                  <div className="timeline-header">
                    <div>
                      <div className="job-role-row">
                        <h3>{getLocalizedText(job, "title", lang)}</h3>
                        {job.current && <span className="live-chip">ACTIVE</span>}
                      </div>
                      <div className="job-company">
                        {job.company} &nbsp;·&nbsp; <span>📍 {job.location}</span>
                      </div>
                    </div>
                    <div className="job-period">{period}</div>
                  </div>

                  <div className="job-domain">
                    {getLocalizedText(job, "domain", lang)}
                  </div>

                  <ul className="job-bullets">
                    {bullets.map((b: string, i: number) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>

                  <div className="job-tags">
                    {(job.tags || []).map((tag: string) => (
                      <span
                        key={tag}
                        className={selectedExpTag === tag ? "tech-tag highlighted" : "tech-tag"}
                        onClick={() => setSelectedExpTag(selectedExpTag === tag ? "ALL" : tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* INTERACTIVE SKILLS MATRIX */}
        <section id="skills" className="section-block">
          <div className="section-header">
            <h2>🛠️ {t.skillsTitle}</h2>
            <p>{t.skillsSubtitle}</p>
          </div>

          <div className="skills-controls">
            <input
              type="search"
              value={skillQuery}
              onChange={(e) => setSkillQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="skill-search-input"
            />
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
                    {info.icon} {info[lang]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="skills-grid">
            {filteredSkills.map((group: any) => {
              const catMeta = CATEGORY_LABELS[group.category] || {
                es: group.category,
                en: group.category,
                icon: "⚡",
              };
              return (
                <div key={group.category} className="skill-domain-card">
                  <h3>
                    <span>{catMeta.icon}</span> {catMeta[lang]}
                  </h3>
                  <div className="skill-items-wrap">
                    {group.items.map((skill: string) => (
                      <span key={skill} className="skill-badge">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURED PROJECTS */}
        <section id="projects" className="section-block">
          <div className="section-header">
            <h2>🚀 {t.projectsTitle}</h2>
            <p>{t.projectsSubtitle}</p>
          </div>

          <div className="projects-grid">
            {(cv.projects || []).map((proj: any, idx: number) => (
              <article key={idx} className="project-card">
                <div className="project-top">
                  <span className="project-cat">{proj.category || "Data & AI"}</span>
                  <h3>{getLocalizedText(proj, "name", lang)}</h3>
                  <p>{getLocalizedText(proj, "description", lang)}</p>
                </div>
                <div className="project-bottom">
                  <div className="project-tools">
                    {(proj.tools || []).map((tool: string) => (
                      <span key={tool} className="tech-tag">
                        {tool}
                      </span>
                    ))}
                  </div>
                  {proj.repo && (
                    <a href={proj.repo} target="_blank" rel="noreferrer" className="project-link">
                      {t.viewRepo}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* LIVE GITHUB REPOSITORIES */}
        <section id="github-live" className="section-block">
          <div className="section-header">
            <h2>⚡ {t.liveReposTitle}</h2>
            <p>{t.liveReposSubtitle}</p>
          </div>

          <div className="repos-grid">
            {githubRepos.map((repo: any) => (
              <a
                key={repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="repo-card"
              >
                <div className="repo-head">
                  <span className="repo-name">📦 {repo.name}</span>
                  <span className="repo-lang">{repo.language || "Python"}</span>
                </div>
                <p className="repo-desc">{repo.description}</p>
                <div className="repo-foot">
                  <span>🕒 {(repo.updated_at || "").slice(0, 10)}</span>
                  <span>GitHub ↗</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* EDUCATION & CERTIFICATIONS */}
        <section id="education" className="section-block">
          <div className="edu-certs-layout">
            <div className="edu-column">
              <h2>🎓 {t.eduTitle}</h2>
              <div className="edu-list">
                {(cv.education || []).map((ed: any, idx: number) => (
                  <div key={idx} className="edu-card">
                    <span className="edu-period">
                      {lang === "en" && ed.period_en ? ed.period_en : ed.period}
                    </span>
                    <h3>{getLocalizedText(ed, "degree", lang)}</h3>
                    <p>{ed.institution}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="certs-column">
              <div className="certs-head">
                <h2>🏅 {t.certsTitle}</h2>
                <a href={meta.platzi} target="_blank" rel="noreferrer" className="platzi-link">
                  {t.verifyPlatzi}
                </a>
              </div>
              <div className="certs-grid">
                {(cv.courses || []).map((course: any, idx: number) => (
                  <div key={idx} className="cert-card">
                    <div className="cert-name">{course.name}</div>
                    <div className="cert-meta">
                      <span>{course.platform}</span>
                      {course.date && <span>· {course.date}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="portal-footer">
        <p>
          ⚡ {t.autoSyncLabel} &nbsp;·&nbsp; <strong>{meta.name}</strong> &nbsp;·&nbsp;{" "}
          <a href={`mailto:${meta.email}`}>{meta.email}</a>
        </p>
      </footer>
    </div>
  );
}
