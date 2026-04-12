#!/usr/bin/env python3
"""
CV Generator
------------
Reads cv_data.yaml → generates CV.pdf (weasyprint) and updates README.md badge.

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
# HTML / CSS template
# ---------------------------------------------------------------------------

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
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
    margin-bottom: 0;
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

  /* ── Status badge ── */
  .badge {{
    background: #f0fdf4;
    border-left: 4px solid #16a34a;
    padding: 5px 12px;
    margin: 8px 0;
    font-size: 9pt;
    font-weight: 700;
    color: #14532d;
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

<!-- HEADER -->
<div class="header">
  <h1>{name}</h1>
  <div class="tagline">{tagline}</div>
  <div class="contacts">
    <span>&#9993; {email}</span>
    <span>&#128241; {phone}</span>
    <span>&#128279; {linkedin}</span>
  </div>
</div>

<!-- STATUS BADGE -->
<div class="badge">&#10003; {readiness_status}</div>

<!-- SUMMARY -->
<div class="section">
  <div class="section-title">Professional Summary</div>
  <div class="summary">{summary}</div>
</div>

<!-- EXPERIENCE -->
<div class="section">
  <div class="section-title">Work Experience</div>
  {experience_html}
</div>

<!-- SKILLS -->
<div class="section">
  <div class="section-title">Technical Skills</div>
  <div class="skills-grid">
    {skills_html}
  </div>
</div>

<!-- PROJECTS + EDUCATION side by side -->
<div class="two-col">
  <div>
    <div class="section">
      <div class="section-title">Featured Projects</div>
      {projects_html}
    </div>
  </div>
  <div>
    <div class="section">
      <div class="section-title">Education</div>
      {education_html}
    </div>
    <div class="section" style="margin-top:8px">
      <div class="section-title">Languages</div>
      {languages_html}
    </div>
  </div>
</div>

<!-- COURSES -->
<div class="section">
  <div class="section-title">Courses &amp; Certifications</div>
  <div class="courses-grid">
    {courses_html}
  </div>
</div>

</body>
</html>"""


# ---------------------------------------------------------------------------
# Renderers
# ---------------------------------------------------------------------------

def _esc(text: str) -> str:
    """Minimal HTML escaping."""
    return (str(text)
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;"))


def render_experience(jobs: list) -> str:
    parts = []
    for job in jobs:
        bullets = "".join(f"<li>{_esc(b)}</li>" for b in job.get("bullets", []))
        desc = f'<div class="job-desc">{_esc(job.get("description", "").strip())}</div>' if job.get("description") else ""
        parts.append(f"""
        <div class="job">
          <div class="job-row">
            <span>
              <span class="job-title">{_esc(job['title'])}</span>
              &nbsp;—&nbsp;
              <span class="job-company">{_esc(job['company'])}, {_esc(job['location'])}</span>
            </span>
            <span class="job-date">{_esc(job['period'])}</span>
          </div>
          {desc}
          <ul>{bullets}</ul>
        </div>""")
    return "\n".join(parts)


SKILL_LABELS = {
    "data_engineering":  "Data Engineering & Orchestration",
    "ml_ai":             "Machine Learning & AI",
    "conversational_ai": "AI Conversational & Chatbots",
    "languages":         "Programming Languages",
    "cloud_devops":      "Cloud & DevOps",
    "databases":         "Databases",
    "visualization":     "Visualization & BI",
}


def render_skills(skills: dict) -> str:
    parts = []
    for key, label in SKILL_LABELS.items():
        if key in skills:
            items = ", ".join(_esc(s) for s in skills[key])
            parts.append(
                f'<div class="skill-row">'
                f'<span class="skill-label">{label}:</span> '
                f'<span class="skill-items">{items}</span>'
                f'</div>'
            )
    return "\n".join(parts)


def render_projects(projects: list) -> str:
    parts = []
    for p in projects:
        tools = ", ".join(_esc(t) for t in p.get("tools", []))
        parts.append(f"""
        <div class="project">
          <div class="project-name">{_esc(p['name'])}</div>
          <div class="project-desc">{_esc(p['description'].strip())}</div>
          <div class="project-tools">Tools: {tools}</div>
        </div>""")
    return "\n".join(parts)


def render_education(edu: list) -> str:
    parts = []
    for e in edu:
        parts.append(
            f'<div class="edu-item">'
            f'<div class="edu-degree">{_esc(e["degree"])}</div>'
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

def generate_pdf(data: dict, output_path: Path) -> None:
    try:
        from weasyprint import HTML
    except ImportError:
        print("ERROR: weasyprint not installed. Run: pip install weasyprint", file=sys.stderr)
        sys.exit(1)

    meta = data["meta"]
    html = HTML_TEMPLATE.format(
        name=_esc(meta["name"]),
        tagline=_esc(meta["tagline"]),
        email=_esc(meta["email"]),
        phone=_esc(meta["phone"]),
        linkedin=_esc(meta["linkedin"]),
        readiness_status=_esc(meta["readiness_status"]),
        summary=_esc(data["summary"].strip()),
        experience_html=render_experience(data["experience"]),
        skills_html=render_skills(data["skills"]),
        projects_html=render_projects(data["projects"]),
        education_html=render_education(data["education"]),
        languages_html=render_languages(data["languages"]),
        courses_html=render_courses(data["courses"]),
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
    status = data["meta"]["readiness_status"]
    now = datetime.now().strftime("%B %d, %Y")

    badge = (
        f"{README_START}\n"
        f"> **Status:** ✅ {status}  \n"
        f"> 📄 [Download CV (PDF)](./CV.pdf) &nbsp;·&nbsp; Last updated: {now}\n"
        f"{README_END}"
    )

    pattern = re.compile(
        re.escape(README_START) + r".*?" + re.escape(README_END),
        re.DOTALL,
    )
    if pattern.search(content):
        content = pattern.sub(badge, content)
    else:
        # Insert right after the first heading line
        content = re.sub(r"(# .+\n)", r"\1\n" + badge + "\n\n", content, count=1)

    readme_path.write_text(content, encoding="utf-8")
    print(f"[OK] Updated:   {readme_path.relative_to(ROOT)}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    yaml_path  = ROOT / "cv_data.yaml"
    pdf_path   = ROOT / "CV.pdf"
    readme_path = ROOT / "README.md"

    if not yaml_path.exists():
        print(f"ERROR: {yaml_path} not found.", file=sys.stderr)
        sys.exit(1)

    with open(yaml_path, encoding="utf-8") as f:
        data = yaml.safe_load(f)

    generate_pdf(data, pdf_path)
    update_readme(data, readme_path)
    print("\nDone. Commit CV.pdf and README.md to publish.")
