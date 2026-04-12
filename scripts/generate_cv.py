#!/usr/bin/env python3
"""
CV Generator
------------
Reads cv_data.yaml -> generates CV_EN.pdf + CV_ES.pdf and updates README.md badge.

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
        "summary":    "Summary",
        "experience": "Experience",
        "skills":     "Skills",
        "projects":   "Projects",
        "education":  "Education",
        "lang":       "Languages",
        "courses":    "Courses & Certifications",
        "tools":      "Tools",
        "skills_map": {
            "data_engineering":  "Data Engineering & Orchestration",
            "ml_ai":             "Machine Learning & AI",
            "conversational_ai": "Conversational AI & Chatbots",
            "languages":         "Programming Languages",
            "cloud_devops":      "Cloud & DevOps",
            "databases":         "Databases",
            "visualization":     "Visualization & BI",
        },
    },
    "es": {
        "summary":    "Perfil",
        "experience": "Experiencia",
        "skills":     "Habilidades",
        "projects":   "Proyectos",
        "education":  "Educación",
        "lang":       "Idiomas",
        "courses":    "Cursos y Certificaciones",
        "tools":      "Herramientas",
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
# HTML template  — clean single-column, ATS-friendly
# ---------------------------------------------------------------------------

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="{lang_code}">
<head>
<meta charset="UTF-8">
<style>
  @page {{
    margin: 16mm 18mm 14mm 18mm;
    size: A4;
  }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9.5pt;
    color: #1a1a1a;
    line-height: 1.5;
    background: #ffffff;
  }}

  /* ── Header ── */
  .header {{
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 2px solid #1e3a5f;
  }}
  .header h1 {{
    font-size: 20pt;
    font-weight: 700;
    color: #1e3a5f;
    letter-spacing: 0.2px;
    line-height: 1.1;
  }}
  .header .tagline {{
    font-size: 9.5pt;
    color: #4a5568;
    margin-top: 3px;
  }}
  .header .contacts {{
    margin-top: 5px;
    font-size: 8.5pt;
    color: #4a5568;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }}
  .header .contacts span {{ display: flex; align-items: center; gap: 3px; }}

  /* ── Section ── */
  .section {{ margin-top: 11px; }}
  .section-title {{
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #1e3a5f;
    border-bottom: 1px solid #1e3a5f;
    padding-bottom: 2px;
    margin-bottom: 7px;
  }}

  /* ── Summary ── */
  .summary {{
    font-size: 9pt;
    color: #2d3748;
    text-align: justify;
  }}

  /* ── Experience ── */
  .job {{ margin-bottom: 9px; }}
  .job:last-child {{ margin-bottom: 0; }}
  .job-header {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }}
  .job-title {{
    font-size: 9.5pt;
    font-weight: 700;
    color: #1a1a1a;
  }}
  .job-date {{
    font-size: 8.5pt;
    color: #4a5568;
    white-space: nowrap;
  }}
  .job-sub {{
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }}
  .job-company {{
    font-size: 9pt;
    color: #2d3748;
    font-style: italic;
  }}
  .job ul {{
    margin-left: 14px;
  }}
  .job ul li {{
    font-size: 9pt;
    color: #2d3748;
    margin-bottom: 2px;
  }}

  /* ── Skills ── */
  .skills-table {{
    width: 100%;
    border-collapse: collapse;
  }}
  .skills-table tr {{ vertical-align: top; }}
  .skills-table td {{
    font-size: 9pt;
    padding: 2px 0;
    color: #2d3748;
  }}
  .skills-table td.label {{
    font-weight: 700;
    color: #1a1a1a;
    width: 42mm;
    white-space: nowrap;
    padding-right: 8px;
  }}
  .skills-table td.label::after {{
    content: ":";
  }}

  /* ── Projects ── */
  .project {{ margin-bottom: 7px; }}
  .project:last-child {{ margin-bottom: 0; }}
  .project-header {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }}
  .project-name {{
    font-size: 9.5pt;
    font-weight: 700;
    color: #1a1a1a;
  }}
  .project-tools {{
    font-size: 8.5pt;
    color: #4a5568;
    font-style: italic;
    white-space: nowrap;
    margin-left: 8px;
  }}
  .project-desc {{
    font-size: 9pt;
    color: #2d3748;
    margin-top: 1px;
  }}

  /* ── Education ── */
  .edu-item {{ margin-bottom: 5px; }}
  .edu-item:last-child {{ margin-bottom: 0; }}
  .edu-header {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }}
  .edu-degree {{
    font-size: 9.5pt;
    font-weight: 700;
    color: #1a1a1a;
  }}
  .edu-inst {{
    font-size: 9pt;
    color: #2d3748;
    font-style: italic;
  }}

  /* ── Languages ── */
  .lang-row {{
    display: flex;
    gap: 20px;
  }}
  .lang-item {{
    font-size: 9pt;
    color: #2d3748;
  }}
  .lang-item strong {{
    color: #1a1a1a;
  }}

  /* ── Courses ── */
  .courses-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 16px;
  }}
  .course {{
    font-size: 8.5pt;
    color: #2d3748;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 1.5px 0;
    border-bottom: 1px solid #e2e8f0;
  }}
  .course-name {{ flex: 1; }}
  .course-date {{
    color: #718096;
    font-size: 8pt;
    white-space: nowrap;
    margin-left: 6px;
  }}
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <h1>{name}</h1>
  <div class="tagline">{tagline}</div>
  <div class="contacts">
    <span>{email}</span>
    <span>{phone}</span>
    <span>{linkedin}</span>
  </div>
</div>

<!-- SUMMARY -->
<div class="section">
  <div class="section-title">{lbl_summary}</div>
  <div class="summary">{summary}</div>
</div>

<!-- EXPERIENCE -->
<div class="section">
  <div class="section-title">{lbl_experience}</div>
  {experience_html}
</div>

<!-- SKILLS -->
<div class="section">
  <div class="section-title">{lbl_skills}</div>
  <table class="skills-table">
    {skills_html}
  </table>
</div>

<!-- PROJECTS -->
<div class="section">
  <div class="section-title">{lbl_projects}</div>
  {projects_html}
</div>

<!-- EDUCATION + LANGUAGES side by side via table -->
<table style="width:100%; border-collapse:collapse; margin-top:11px;">
<tr style="vertical-align:top;">
  <td style="width:60%; padding-right:12px;">
    <div class="section-title">{lbl_education}</div>
    {education_html}
  </td>
  <td style="width:40%;">
    <div class="section-title">{lbl_lang}</div>
    {languages_html}
  </td>
</tr>
</table>

<!-- COURSES -->
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
    return obj.get(f"{key}_{lang}") or obj.get(key, "")


# ---------------------------------------------------------------------------
# Renderers
# ---------------------------------------------------------------------------

def render_skills(skills: dict, lang: str) -> str:
    skill_map = LABELS[lang]["skills_map"]
    rows = []
    for key, label in skill_map.items():
        if key not in skills:
            continue
        items = ", ".join(_esc(s) for s in skills[key])
        rows.append(
            f"<tr>"
            f'<td class="label">{label}</td>'
            f"<td>{items}</td>"
            f"</tr>"
        )
    return "\n".join(rows)


def render_experience(jobs: list, lang: str) -> str:
    parts = []
    for job in jobs:
        title   = _t(job, "title", lang)
        bullets = job.get(f"bullets_{lang}") or job.get("bullets", [])
        bullet_html = "".join(f"<li>{_esc(b)}</li>" for b in bullets)
        parts.append(f"""
        <div class="job">
          <div class="job-header">
            <span class="job-title">{_esc(title)}</span>
            <span class="job-date">{_esc(job['period'])}</span>
          </div>
          <div class="job-sub">
            <span class="job-company">{_esc(job['company'])}, {_esc(job['location'])}</span>
          </div>
          <ul>{bullet_html}</ul>
        </div>""")
    return "\n".join(parts)


def render_projects(projects: list, lang: str) -> str:
    lbl_tools = LABELS[lang]["tools"]
    parts = []
    for p in projects:
        name  = _t(p, "name", lang)
        desc  = _t(p, "description", lang).strip()
        tools = ", ".join(_esc(t) for t in p.get("tools", []))
        parts.append(
            f'<div class="project">'
            f'<div class="project-header">'
            f'<span class="project-name">{_esc(name)}</span>'
            f'<span class="project-tools">{lbl_tools}: {tools}</span>'
            f'</div>'
            f'<div class="project-desc">{_esc(desc)}</div>'
            f'</div>'
        )
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
    items = "".join(
        f'<div class="lang-item"><strong>{_esc(l["lang"])}</strong> — {_esc(l["level"])}</div>'
        for l in langs
    )
    return items


def render_courses(courses: list) -> str:
    parts = []
    for c in courses:
        date = _esc(c["date"]) if c.get("date") else ""
        parts.append(
            f'<div class="course">'
            f'<span class="course-name">{_esc(c["name"])}</span>'
            f'<span class="course-date">{date}</span>'
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
        lang_code       = lang,
        name            = _esc(meta["name"]),
        tagline         = _esc(meta[f"tagline_{lang}"]),
        email           = _esc(meta["email"]),
        phone           = _esc(meta["phone"]),
        linkedin        = _esc(meta["linkedin"]),
        lbl_summary     = lbl["summary"],
        lbl_experience  = lbl["experience"],
        lbl_skills      = lbl["skills"],
        lbl_projects    = lbl["projects"],
        lbl_education   = lbl["education"],
        lbl_lang        = lbl["lang"],
        lbl_courses     = lbl["courses"],
        summary         = _esc(data[f"summary_{lang}"].strip()),
        experience_html = render_experience(data["experience"], lang),
        skills_html     = render_skills(data["skills"], lang),
        projects_html   = render_projects(data["projects"], lang),
        education_html  = render_education(data["education"], lang),
        languages_html  = render_languages(data["spoken_languages"]),
        courses_html    = render_courses(data["courses"]),
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
        f"<!-- status: {status} | updated: {now} -->\n"
        f'📄 **CV / Resume:** &nbsp;[🇬🇧 English](./CV_EN.pdf) &nbsp;·&nbsp; [🇨🇴 Español](./CV_ES.pdf)\n'
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
