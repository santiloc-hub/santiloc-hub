#!/usr/bin/env python3
"""
CV Generator
------------
Reads cv_data.yaml → generates CV_EN.pdf + CV_ES.pdf and updates README.md badge.

Usage:
  pip install weasyprint pyyaml
  python scripts/generate_cv.py
"""

import re
import sys
import yaml
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.parent

# ---------------------------------------------------------------------------
# Labels per language
# ---------------------------------------------------------------------------

LABELS = {
    "en": {
        "summary":     "Professional Summary",
        "experience":  "Work Experience",
        "skills":      "Technical Skills",
        "projects":    "Featured Projects",
        "education":   "Education",
        "lang":        "Languages",
        "courses":     "Courses & Certifications",
        "skills_map": {
            "data_engineering":  "Data Engineering & Orchestration",
            "ml_ai":             "Machine Learning & AI",
            "conversational_ai": "AI Conversational & Chatbots",
            "languages":         "Programming Languages",
            "cloud_devops":      "Cloud & DevOps",
            "databases":         "Databases",
            "visualization":     "Visualization & BI",
        },
    },
    "es": {
        "summary":     "Perfil Profesional",
        "experience":  "Experiencia Laboral",
        "skills":      "Habilidades Técnicas",
        "projects":    "Proyectos Destacados",
        "education":   "Educación",
        "lang":        "Idiomas",
        "courses":     "Cursos y Certificaciones",
        "skills_map": {
            "data_engineering":  "Ingeniería de Datos y Orquestación",
            "ml_ai":             "Machine Learning e IA",
            "conversational_ai": "IA Conversacional y Chatbots",
            "languages":         "Lenguajes de Programación",
            "cloud_devops":      "Cloud y DevOps",
            "databases":         "Bases de Datos",
            "visualization":     "Visualización y BI",
        },
    },
}

# ---------------------------------------------------------------------------
# HTML / CSS template
# ---------------------------------------------------------------------------

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="{lang_code}">
<head>
<meta charset="UTF-8">
<style>
  @page {{
    margin: 14mm 16mm 14mm 16mm;
    size: A4;
  }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9.5pt;
    color: #1f2937;
    line-height: 1.45;
  }}

  /* ── Header ── */
  .header {{
    background: #1e3a8a;
    color: #ffffff;
    padding: 13px 16px 11px;
  }}
  .header h1 {{
    font-size: 21pt;
    font-weight: 700;
    letter-spacing: 0.5px;
    line-height: 1.1;
  }}
  .header .tagline {{
    font-size: 9.5pt;
    color: #93c5fd;
    margin-top: 2px;
  }}
  .header .contacts {{
    margin-top: 6px;
    font-size: 8.5pt;
    color: #dbeafe;
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
  }}

  /* ── Sections ── */
  .section {{ margin-top: 9px; }}
  .section-title {{
    font-size: 9.5pt;
    font-weight: 700;
    color: #1e3a8a;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    border-bottom: 1.5px solid #3b82f6;
    padding-bottom: 2px;
    margin-bottom: 6px;
  }}

  /* ── Summary ── */
  .summary {{ font-size: 9pt; color: #374151; }}

  /* ── Experience ── */
  .job {{ margin-bottom: 8px; }}
  .job-row {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }}
  .job-title {{ font-weight: 700; font-size: 9.5pt; color: #1e3a8a; }}
  .job-company {{ font-size: 9pt; color: #4b5563; font-style: italic; }}
  .job-date {{ font-size: 8.5pt; color: #6b7280; white-space: nowrap; }}
  .job-desc {{ font-size: 8.5pt; color: #4b5563; margin: 2px 0 3px; }}
  .job ul {{ margin-left: 13px; }}
  .job ul li {{ font-size: 8.5pt; color: #374151; margin-bottom: 1.5px; }}

  /* ── Skills ── */
  .skills-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 20px;
  }}
  .skill-row {{ font-size: 8.8pt; }}
  .skill-label {{ font-weight: 700; color: #1e3a8a; }}
  .skill-items {{ color: #374151; }}

  /* ── Two-column lower body ── */
  .two-col {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 20px;
    margin-top: 9px;
  }}

  /* ── Projects ── */
  .project {{ margin-bottom: 6px; }}
  .project-name {{ font-weight: 700; font-size: 9pt; color: #1e3a8a; }}
  .project-desc {{ font-size: 8.5pt; color: #374151; margin: 1px 0; }}
  .project-tools {{ font-size: 8pt; color: #6b7280; }}

  /* ── Education / Languages ── */
  .edu-item {{ margin-bottom: 4px; font-size: 9pt; }}
  .edu-degree {{ font-weight: 700; color: #1f2937; }}
  .edu-inst {{ color: #6b7280; font-size: 8.5pt; }}

  /* ── Courses ── */
  .courses-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px 20px;
  }}
  .course {{ font-size: 8.5pt; }}
  .course-name {{ font-weight: 600; color: #1f2937; }}
  .course-meta {{ color: #6b7280; }}
</style>
</head>
<body>

<div class="header">
  <h1>{name}</h1>
  <div class="tagline">{tagline}</div>
  <div class="contacts">
    <span>&#9993; {email}</span>
    <span>&#128241; {phone}</span>
    <span>&#128279; {linkedin}</span>
  </div>
</div>

<div class="section">
  <div class="section-title">{lbl_summary}</div>
  <div class="summary">{summary}</div>
</div>

<div class="section">
  <div class="section-title">{lbl_experience}</div>
  {experience_html}
</div>

<div class="section">
  <div class="section-title">{lbl_skills}</div>
  <div class="skills-grid">
    {skills_html}
  </div>
</div>

<div class="two-col">
  <div>
    <div class="section">
      <div class="section-title">{lbl_projects}</div>
      {projects_html}
    </div>
  </div>
  <div>
    <div class="section">
      <div class="section-title">{lbl_education}</div>
      {education_html}
    </div>
    <div class="section" style="margin-top:8px">
      <div class="section-title">{lbl_lang}</div>
      {languages_html}
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">{lbl_courses}</div>
  <div class="courses-grid">
    {courses_html}
  </div>
</div>

</body>
</html>"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _esc(text: str) -> str:
    return (str(text)
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;"))


def _t(obj: dict, key: str, lang: str) -> str:
    """Get lang-specific value: obj[key_en] or obj[key_es], fallback to obj[key]."""
    return obj.get(f"{key}_{lang}") or obj.get(key, "")


# ---------------------------------------------------------------------------
# Renderers
# ---------------------------------------------------------------------------

def render_experience(jobs: list, lang: str) -> str:
    parts = []
    for job in jobs:
        title = _t(job, "title", lang)
        desc  = _t(job, "description", lang).strip()
        bullets = job.get(f"bullets_{lang}") or job.get("bullets", [])
        bullet_html = "".join(f"<li>{_esc(b)}</li>" for b in bullets)
        desc_html = f'<div class="job-desc">{_esc(desc)}</div>' if desc else ""
        parts.append(f"""
        <div class="job">
          <div class="job-row">
            <span>
              <span class="job-title">{_esc(title)}</span>
              &nbsp;—&nbsp;
              <span class="job-company">{_esc(job['company'])}, {_esc(job['location'])}</span>
            </span>
            <span class="job-date">{_esc(job['period'])}</span>
          </div>
          {desc_html}
          <ul>{bullet_html}</ul>
        </div>""")
    return "\n".join(parts)


def render_skills(skills: dict, lang: str) -> str:
    skill_map = LABELS[lang]["skills_map"]
    parts = []
    for key, label in skill_map.items():
        if key in skills:
            items = ", ".join(_esc(s) for s in skills[key])
            parts.append(
                f'<div class="skill-row">'
                f'<span class="skill-label">{label}:</span> '
                f'<span class="skill-items">{items}</span>'
                f'</div>'
            )
    return "\n".join(parts)


def render_projects(projects: list, lang: str) -> str:
    parts = []
    for p in projects:
        name  = _t(p, "name", lang)
        desc  = _t(p, "description", lang).strip()
        tools = ", ".join(_esc(t) for t in p.get("tools", []))
        tools_label = "Tools" if lang == "en" else "Herramientas"
        parts.append(f"""
        <div class="project">
          <div class="project-name">{_esc(name)}</div>
          <div class="project-desc">{_esc(desc)}</div>
          <div class="project-tools">{tools_label}: {tools}</div>
        </div>""")
    return "\n".join(parts)


def render_education(edu: list, lang: str) -> str:
    parts = []
    for e in edu:
        degree = _t(e, "degree", lang)
        parts.append(
            f'<div class="edu-item">'
            f'<div class="edu-degree">{_esc(degree)}</div>'
            f'<div class="edu-inst">{_esc(e["institution"])}</div>'
            f'</div>'
        )
    return "\n".join(parts)


def render_languages(langs: list) -> str:
    parts = []
    for lang in langs:
        parts.append(
            f'<div class="edu-item">'
            f'{_esc(lang["lang"])} '
            f'<span style="color:#6b7280">({_esc(lang["level"])})</span>'
            f'</div>'
        )
    return "\n".join(parts)


def render_courses(courses: list) -> str:
    parts = []
    for c in courses:
        date = f" ({_esc(c['date'])})" if c.get("date") else ""
        parts.append(
            f'<div class="course">'
            f'<span class="course-name">{_esc(c["name"])}</span>'
            f' <span class="course-meta">— {_esc(c["platform"])}{date}</span>'
            f'</div>'
        )
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# PDF generation
# ---------------------------------------------------------------------------

def generate_pdf(data: dict, lang: str, output_path: Path) -> None:
    try:
        from weasyprint import HTML
    except ImportError:
        print("ERROR: weasyprint not installed. Run: pip install weasyprint", file=sys.stderr)
        sys.exit(1)

    lbl  = LABELS[lang]
    meta = data["meta"]

    html = HTML_TEMPLATE.format(
        lang_code        = lang,
        name             = _esc(meta["name"]),
        tagline          = _esc(meta[f"tagline_{lang}"]),
        email            = _esc(meta["email"]),
        phone            = _esc(meta["phone"]),
        linkedin         = _esc(meta["linkedin"]),
        lbl_summary      = lbl["summary"],
        lbl_experience   = lbl["experience"],
        lbl_skills       = lbl["skills"],
        lbl_projects     = lbl["projects"],
        lbl_education    = lbl["education"],
        lbl_lang         = lbl["lang"],
        lbl_courses      = lbl["courses"],
        summary          = _esc(data[f"summary_{lang}"].strip()),
        experience_html  = render_experience(data["experience"], lang),
        skills_html      = render_skills(data["skills"], lang),
        projects_html    = render_projects(data["projects"], lang),
        education_html   = render_education(data["education"], lang),
        languages_html   = render_languages(data["spoken_languages"]),
        courses_html     = render_courses(data["courses"]),
    )

    HTML(string=html, base_url=str(ROOT)).write_pdf(str(output_path))
    print(f"[OK] Generated: {output_path.relative_to(ROOT)}")


# ---------------------------------------------------------------------------
# README badge update
# ---------------------------------------------------------------------------

README_START = "<!--CV_STATUS:start-->"
README_END   = "<!--CV_STATUS:end-->"


def update_readme(data: dict, readme_path: Path) -> None:
    content = readme_path.read_text(encoding="utf-8")
    status  = data["meta"]["readiness_status"]
    now     = datetime.now().strftime("%B %d, %Y")

    badge = (
        f"{README_START}\n"
        f"<!-- status: {status} | cv_en: ./CV_EN.pdf | cv_es: ./CV_ES.pdf | updated: {now} -->\n"
        f"{README_END}"
    )

    pattern = re.compile(
        re.escape(README_START) + r".*?" + re.escape(README_END),
        re.DOTALL,
    )
    if pattern.search(content):
        content = pattern.sub(badge, content)
    else:
        content = re.sub(r"(# .+\n)", r"\1\n" + badge + "\n\n", content, count=1)

    readme_path.write_text(content, encoding="utf-8")
    print(f"[OK] Updated:   {readme_path.relative_to(ROOT)}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    yaml_path   = ROOT / "cv_data.yaml"
    readme_path = ROOT / "README.md"

    if not yaml_path.exists():
        print(f"ERROR: {yaml_path} not found.", file=sys.stderr)
        sys.exit(1)

    with open(yaml_path, encoding="utf-8") as f:
        data = yaml.safe_load(f)

    generate_pdf(data, "en", ROOT / "CV_EN.pdf")
    generate_pdf(data, "es", ROOT / "CV_ES.pdf")
    update_readme(data, readme_path)
    print("\nDone. Commit CV_EN.pdf, CV_ES.pdf and README.md to publish.")
