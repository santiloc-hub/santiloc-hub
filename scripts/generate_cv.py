#!/usr/bin/env python3
"""
Santiloc-Hub Experience Ecosystem Generator
-------------------------------------------
Single Source of Truth pipeline:
Reads cv_data.yaml (+ live GitHub public repos) -> generates:
  1. assets/banner.svg  (Dynamic Dark-Tech Hero Cover)
  2. README.md          (Executive GitHub Profile Portal)
  3. CV_ES.pdf          (Spanish ATS Resume via WeasyPrint)
  4. CV_EN.pdf          (English ATS Resume via WeasyPrint)
  5. portal/src/data/generated_profile.json (Synced data + live repos for Astro/React Portal)
"""

import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Labels per language
# ---------------------------------------------------------------------------

LABELS = {
    "en": {
        "summary": "Professional Summary",
        "experience": "Professional Experience",
        "skills": "Technical Skills",
        "projects": "Featured Projects",
        "education": "Education",
        "lang": "Languages",
        "courses": "Certifications & Courses",
        "tools": "Stack",
        "skills_map": {
            "data_engineering": "Data Engineering & Orchestration",
            "ml_ai": "Machine Learning & Data Science",
            "conversational_ai": "Conversational AI & MCP Agents",
            "cloud_devops": "Cloud, DevOps & IaC",
            "languages": "Programming Languages",
            "databases": "Databases & Warehousing",
            "visualization": "Visualization & BI",
        },
    },
    "es": {
        "summary": "Resumen Profesional",
        "experience": "Experiencia Profesional",
        "skills": "Habilidades Técnicas",
        "projects": "Proyectos Destacados",
        "education": "Educación",
        "lang": "Idiomas",
        "courses": "Certificaciones y Cursos",
        "tools": "Herramientas",
        "skills_map": {
            "data_engineering": "Ingeniería de Datos y Orquestación",
            "ml_ai": "Ciencia de Datos y Machine Learning",
            "conversational_ai": "IA Conversacional y Agentes MCP",
            "cloud_devops": "Cloud, DevOps e IaC",
            "languages": "Lenguajes de Programación",
            "databases": "Bases de Datos y Data Warehouse",
            "visualization": "Visualización y BI",
        },
    },
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _esc(text: str) -> str:
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _t(obj: dict, key: str, lang: str) -> str:
    return obj.get(f"{key}_{lang}") or obj.get(key, "")


# ---------------------------------------------------------------------------
# 1. Dynamic SVG Cover Banner Generator (assets/banner.svg)
# ---------------------------------------------------------------------------


def render_banner_svg(data: dict) -> str:
    meta = data["meta"]
    current_job = data["experience"][0]
    current_role_es = _esc(current_job["title_es"])
    current_company = _esc(current_job["company"].split("—")[0].strip())
    location = _esc(meta.get("location_es", "Bogotá, Colombia"))

    badges = meta.get(
        "hero_badges",
        [
            "Python",
            "SQL",
            "Snowflake",
            "Apache Airflow",
            "dbt",
            "AWS & Terraform",
            "Scikit-learn & MLflow",
            "MCP & AI Agents",
            "FastAPI",
        ],
    )

    badge_elements = []
    x_cursor = 64
    y_cursor = 276
    for idx, b_text in enumerate(badges):
        label = _esc(b_text)
        width = max(78, int(len(b_text) * 7.5 + 28))
        if x_cursor + width > 780:
            x_cursor = 64
            y_cursor += 38

        is_gold = idx in (0, 2, 5, 7)
        stroke = "#ffd98e" if is_gold else "#2e2d2b"
        fill = "rgba(255, 217, 142, 0.10)" if is_gold else "#191919"
        text_color = "#ffd98e" if is_gold else "#eaeaea"

        badge_elements.append(
            f'<g transform="translate({x_cursor}, {y_cursor})">'
            f'<rect width="{width}" height="28" rx="14" fill="{fill}" stroke="{stroke}" stroke-width="1"/>'
            f'<text x="{width / 2:.1f}" y="18.5" fill="{text_color}" font-family="Inter, \'Segoe UI\', system-ui, sans-serif" '
            f'font-size="11.5" font-weight="600" text-anchor="middle">{label}</text>'
            f"</g>"
        )
        x_cursor += width + 10

    badges_svg = "\n    ".join(badge_elements)
    stats = meta.get("stats", [])
    s0_val = _esc(stats[0]["value"]) if len(stats) > 0 else "3"
    s1_val = _esc(stats[1]["value"]) if len(stats) > 1 else "15+"
    s2_val = _esc(stats[2]["value"]) if len(stats) > 2 else "13+"

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 380" width="100%" height="100%">
  <defs>
    <linearGradient id="bgObsidian" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f0e0e"/>
      <stop offset="55%" stop-color="#141313"/>
      <stop offset="100%" stop-color="#191919"/>
    </linearGradient>
    <radialGradient id="goldGlow" cx="78%" cy="22%" r="48%">
      <stop offset="0%" stop-color="#ffd98e" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#ffd98e" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffd98e"/>
      <stop offset="65%" stop-color="#fcfcfc" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#0f0e0e" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Warm Obsidian Canvas (#0f0e0e) -->
  <rect width="1280" height="380" rx="20" fill="url(#bgObsidian)"/>
  <rect width="1280" height="380" rx="20" fill="url(#goldGlow)"/>
  <rect x="1" y="1" width="1278" height="378" rx="19" fill="none" stroke="#262524" stroke-width="1.5"/>

  <!-- Top Editorial HUD Bar -->
  <text x="64" y="46" fill="#999999" font-family="Inter, 'Segoe UI', sans-serif" font-size="11.5" font-weight="600" letter-spacing="1.8">
    PORTFOLIO &amp; EXPERIENCE HUB  //  BOGOTÁ, CO
  </text>
  <g transform="translate(430, 30)">
    <rect width="340" height="24" rx="12" fill="#191919" stroke="#2e2d2b" stroke-width="1"/>
    <circle cx="14" cy="12" r="4" fill="#ffd98e"/>
    <text x="26" y="16" fill="#fcfcfc" font-family="Inter, 'Segoe UI', sans-serif" font-size="11" font-weight="500">
      {current_role_es} @ {current_company}
    </text>
  </g>
  <line x1="64" y1="64" x2="1216" y2="64" stroke="#242322" stroke-width="1"/>

  <!-- Avatar Squircle Badge + Champagne Gold Name -->
  <g transform="translate(64, 88)">
    <rect width="58" height="58" rx="14" fill="#191919" stroke="#ffd98e" stroke-width="1.5"/>
    <text x="29" y="36" fill="#ffd98e" font-family="Inter, 'Segoe UI', sans-serif" font-size="21" font-weight="800" text-anchor="middle">
      SM
    </text>
  </g>

  <text x="138" y="114" fill="#ffd98e" font-family="Inter, 'Segoe UI', system-ui, sans-serif" font-size="22" font-weight="700" letter-spacing="-0.3">
    Santiago Montaña
  </text>
  <text x="138" y="138" fill="#999999" font-family="Inter, 'Segoe UI', system-ui, sans-serif" font-size="13.5" font-weight="500">
    Data Scientist, Data &amp; AI Engineer &amp; Electronic Engineer (UPTC)
  </text>

  <!-- Editorial Headline (Jake Sinclair Style) -->
  <text x="64" y="188" fill="#fcfcfc" font-family="Inter, 'Segoe UI', system-ui, sans-serif" font-size="31" font-weight="800" letter-spacing="-0.8">
    Shaping scalable data pipelines, predictive ML
  </text>
  <text x="64" y="226" fill="#fcfcfc" font-family="Inter, 'Segoe UI', system-ui, sans-serif" font-size="31" font-weight="800" letter-spacing="-0.8">
    models &amp; autonomous AI agents in production.
  </text>

  <rect x="64" y="246" width="220" height="2" fill="url(#goldLine)"/>

  <!-- Dynamic Stack Pills -->
  {badges_svg}

  <!-- Right Column: Editorial Capabilities & Telemetry Card -->
  <g transform="translate(820, 84)">
    <rect width="396" height="262" rx="16" fill="#151414" stroke="#292827" stroke-width="1.2"/>
    <text x="24" y="34" fill="#ffd98e" font-family="Consolas, 'Courier New', monospace" font-size="11" font-weight="700" letter-spacing="1.4">
      01 // CORE ARCHITECTURE
    </text>
    <text x="372" y="34" fill="#7c7c7c" font-family="Consolas, 'Courier New', monospace" font-size="11" text-anchor="end">
      LIVE SYNC
    </text>
    <line x1="24" y1="48" x2="372" y2="48" stroke="#242322" stroke-width="1"/>

    <g font-family="Inter, 'Segoe UI', sans-serif" font-size="12.5">
      <text x="24" y="76" fill="#7c7c7c" font-weight="600">DATA &amp; ELT</text>
      <text x="130" y="76" fill="#fcfcfc" font-weight="600">Snowflake · Airflow · dbt · Meltano</text>

      <text x="24" y="104" fill="#7c7c7c" font-weight="600">ML &amp; SIMS</text>
      <text x="130" y="104" fill="#fcfcfc" font-weight="600">Scikit-learn · Monte Carlo · MLflow</text>

      <text x="24" y="132" fill="#7c7c7c" font-weight="600">AI &amp; MCP</text>
      <text x="130" y="132" fill="#ffd98e" font-weight="600">MCP Agents · Claude · ElevenLabs</text>

      <text x="24" y="160" fill="#7c7c7c" font-weight="600">CLOUD IaC</text>
      <text x="130" y="160" fill="#fcfcfc" font-weight="600">AWS (EC2, S3, IAM) · Terraform · FastAPI</text>
    </g>

    <line x1="24" y1="180" x2="372" y2="180" stroke="#242322" stroke-width="1"/>

    <!-- Minimalist Gold/Obsidian Metrics -->
    <g transform="translate(24, 194)">
      <rect width="108" height="50" rx="10" fill="#191919" stroke="#262524"/>
      <text x="54" y="24" fill="#ffd98e" font-family="Inter, sans-serif" font-size="18" font-weight="800" text-anchor="middle">{s0_val}</text>
      <text x="54" y="40" fill="#999999" font-family="Inter, sans-serif" font-size="9.5" text-anchor="middle">ROLES DATOS &amp; IA</text>
    </g>
    <g transform="translate(144, 194)">
      <rect width="108" height="50" rx="10" fill="#191919" stroke="#262524"/>
      <text x="54" y="24" fill="#fcfcfc" font-family="Inter, sans-serif" font-size="18" font-weight="800" text-anchor="middle">{s1_val}</text>
      <text x="54" y="40" fill="#999999" font-family="Inter, sans-serif" font-size="9.5" text-anchor="middle">PIPELINES &amp; MODELOS</text>
    </g>
    <g transform="translate(264, 194)">
      <rect width="108" height="50" rx="10" fill="#191919" stroke="#262524"/>
      <text x="54" y="24" fill="#ffd98e" font-family="Inter, sans-serif" font-size="18" font-weight="800" text-anchor="middle">{s2_val}</text>
      <text x="54" y="40" fill="#999999" font-family="Inter, sans-serif" font-size="9.5" text-anchor="middle">CERTIFICACIONES</text>
    </g>
  </g>
</svg>
"""


# ---------------------------------------------------------------------------
# 2. Fetch Public GitHub Repositories (Clean Activity without undefined bugs)
# ---------------------------------------------------------------------------


def fetch_github_repos(username: str = "santiloc-hub", limit: int = 8) -> list:
    url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page=20"
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "santiloc-hub-portal-builder"}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            repos = json.loads(resp.read().decode("utf-8"))
            filtered = [
                {
                    "name": r.get("name", ""),
                    "html_url": r.get("html_url", ""),
                    "description": r.get("description") or "Repositorio de ingeniería, analítica de datos e IA.",
                    "language": r.get("language") or "Python",
                    "updated_at": r.get("updated_at", ""),
                    "topics": r.get("topics", []),
                    "stargazers_count": r.get("stargazers_count", 0),
                }
                for r in repos
                if not r.get("fork", False) and r.get("name") != username
            ]
            return filtered[:limit]
    except Exception as exc:
        print(f"[WARN] Could not fetch live GitHub repos ({exc}); using curated fallback.", file=sys.stderr)
        return []


# ---------------------------------------------------------------------------
# 3. Executive README.md Generator
# ---------------------------------------------------------------------------


def render_readme(data: dict, github_repos: list | None = None) -> str:
    meta = data["meta"]
    portal_url = meta["portal_url"]
    linkedin = meta["linkedin"]
    platzi = meta.get("platzi", "https://platzi.com/p/santiloc23456")
    email = meta["email"]
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    # Experience section
    exp_blocks = []
    for job in data["experience"]:
        badge_state = "🟢 **ACTUAL**" if job.get("current") else "🔹"
        tags_inline = " · ".join(f"`{t}`" for t in job.get("tags", []))
        bullets = "\n".join(f"  - {b}" for b in job.get("bullets_es", []))
        exp_blocks.append(
            f"### {badge_state} {job['title_es']} — **{job['company']}**\n"
            f"📅 *{job['period']}* &nbsp;|&nbsp; 📍 *{job['location']}*\n\n"
            f"{bullets}\n\n"
            f"**Stack & Dominio:** {tags_inline}\n"
        )
    experience_md = "\n---\n\n".join(exp_blocks)

    # Skills table
    skills_rows = []
    skill_labels = LABELS["es"]["skills_map"]
    for key, label in skill_labels.items():
        if key in data["skills"]:
            items = " · ".join(f"`{s}`" for s in data["skills"][key])
            skills_rows.append(f"| **{label}** | {items} |")
    skills_md = "| Dominio | Tecnologías & Herramientas |\n| :--- | :--- |\n" + "\n".join(skills_rows)

    # Featured Projects table
    proj_rows = []
    for p in data["projects"]:
        repo_link = p.get("repo", meta["github"])
        tools = ", ".join(f"`{t}`" for t in p.get("tools", []))
        desc = p["description_es"].strip().replace("\n", " ")
        proj_rows.append(
            f"| **[🔗 {p['name_es']}]({repo_link})**<br><sub>*{p.get('category', 'Data & AI')}*</sub> | {desc} | {tools} |"
        )
    projects_md = (
        "| Proyecto | Descripción | Stack |\n| :--- | :--- | :--- |\n" + "\n".join(proj_rows)
    )

    # Live GitHub repositories section (replaces broken undefined commit workflow)
    repo_rows = []
    repos_to_show = github_repos or []
    for r in repos_to_show[:6]:
        updated = (r.get("updated_at") or "")[:10]
        lang = r.get("language") or "Python"
        desc = (r.get("description") or "Proyecto de código abierto en GitHub.").replace("|", "-")
        repo_rows.append(
            f"| **[`{r['name']}`]({r['html_url']})** | {desc} | `{lang}` | `{updated}` |"
        )

    if repo_rows:
        live_repos_md = (
            "| Repositorio | Descripción | Lenguaje | Última actualización |\n"
            "| :--- | :--- | :--- | :--- |\n" + "\n".join(repo_rows)
        )
    else:
        live_repos_md = (
            f"Explora todos mis repositorios activos en **[github.com/{meta.get('github_username', 'santiloc-hub')}]({meta['github']})**."
        )

    # Education & Certifications
    edu_lines = [
        f"- 🎓 **{e['degree_es']}** — *{e['institution']}*" for e in data["education"]
    ]
    edu_md = "\n".join(edu_lines)

    cert_pills = " · ".join(f"`{c['name']} ({c['date']})`" if c.get("date") else f"`{c['name']}`" for c in data["courses"])

    return f"""<div align="center">
  <a href="{portal_url}">
    <img src="./assets/banner.svg" alt="Santiago Montaña — Data Scientist & Data/AI Engineer Banner" width="100%" />
  </a>
  <br/>

  <!--CV_STATUS:start-->
  <!-- status: {meta['readiness_status']} | updated: {now_str} -->
  <p align="center">
    <a href="{portal_url}"><img src="https://img.shields.io/badge/🌐_PORTAL_INTERACTIVO-Ver_Experiencia_En_Vivo-06b6d4?style=for-the-badge&logoColor=white" alt="Portal Interactivo" /></a>
    <a href="./CV_ES.pdf"><img src="https://img.shields.io/badge/📄_Hoja_de_Vida_(ES)-Descargar_PDF-10b981?style=for-the-badge" alt="CV Español" /></a>
    <a href="./CV_EN.pdf"><img src="https://img.shields.io/badge/📄_Resume_(EN)-Download_PDF-3b82f6?style=for-the-badge" alt="CV English" /></a>
    <a href="{linkedin}"><img src="https://img.shields.io/badge/LinkedIn-Santiago_Montaña-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
    <a href="mailto:{email}"><img src="https://img.shields.io/badge/Email-Contacto_Directo-ea4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" /></a>
  </p>
  <!--CV_STATUS:end-->
</div>

---

## 👋 Perfil Profesional / Executive Summary

**🇨🇴 Español:** {data['summary_es'].strip()}

**🇬🇧 English:** {data['summary_en'].strip()}

> 💡 **¿Quieres explorar mi trayectoria de forma interactiva?** Visita mi **[Portal Web de Experiencia ({portal_url})]({portal_url})** con filtros dinámicos por tecnología, línea de tiempo interactiva y selector de idioma ES/EN.

---

## 💼 Trayectoria Profesional (Auto-Sincronizada)

{experience_md}

---

## 🛠️ Matriz de Habilidades Técnicas

{skills_md}

---

## 🚀 Proyectos Destacados de Ingeniería, Datos e IA

{projects_md}

---

## ⚡ Repositorios y Actividad Reciente en GitHub

{live_repos_md}

---

## 🎓 Educación & Certificaciones Verificables

### Formación Académica
{edu_md}

### Certificaciones Destacadas ([Ver credenciales en Platzi ↗]({platzi}))
{cert_pills}

---

<div align="center">
  <sub>⚡ <b>Ecosistema Auto-Actualizable:</b> Este perfil, la portada SVG, el <a href="{portal_url}">Portal Web en Astro + React</a> y los CVs en PDF (<a href="./CV_ES.pdf">ES</a> / <a href="./CV_EN.pdf">EN</a>) se generan automáticamente desde <a href="./cv_data.yaml"><code>cv_data.yaml</code></a> mediante GitHub Actions. Última sincronización: <code>{now_str}</code>.</sub>
</div>
"""


# ---------------------------------------------------------------------------
# 4. HTML / WeasyPrint PDF Resume Generator
# ---------------------------------------------------------------------------

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="{lang_code}">
<head>
<meta charset="UTF-8">
<style>
  @page {{
    margin: 14mm 16mm 13mm 16mm;
    size: A4;
  }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9.2pt;
    color: #1a1a1a;
    line-height: 1.45;
    background: #ffffff;
  }}
  .header {{
    margin-bottom: 9px;
    padding-bottom: 8px;
    border-bottom: 2px solid #0f766e;
  }}
  .header h1 {{
    font-size: 20pt;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: 0.2px;
    line-height: 1.1;
  }}
  .header .tagline {{
    font-size: 9.5pt;
    font-weight: 700;
    color: #0f766e;
    margin-top: 3px;
  }}
  .header .contacts {{
    margin-top: 4px;
    font-size: 8.3pt;
    color: #475569;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }}
  .section {{ margin-top: 9px; }}
  .section-title {{
    font-size: 8.8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.1px;
    color: #0f766e;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 2px;
    margin-bottom: 6px;
  }}
  .summary {{
    font-size: 8.9pt;
    color: #1e293b;
    text-align: justify;
  }}
  .job {{ margin-bottom: 8px; }}
  .job:last-child {{ margin-bottom: 0; }}
  .job-header {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }}
  .job-title {{
    font-size: 9.3pt;
    font-weight: 700;
    color: #0f172a;
  }}
  .job-date {{
    font-size: 8.3pt;
    color: #475569;
    white-space: nowrap;
  }}
  .job-sub {{
    display: flex;
    justify-content: space-between;
    margin-bottom: 3px;
  }}
  .job-company {{
    font-size: 8.7pt;
    color: #334155;
    font-style: italic;
  }}
  .job ul {{ margin-left: 14px; }}
  .job ul li {{
    font-size: 8.7pt;
    color: #1e293b;
    margin-bottom: 1.5px;
  }}
  .skills-table {{
    width: 100%;
    border-collapse: collapse;
  }}
  .skills-table tr {{ vertical-align: top; }}
  .skills-table td {{
    font-size: 8.6pt;
    padding: 1.8px 0;
    color: #1e293b;
  }}
  .skills-table td.label {{
    font-weight: 700;
    color: #0f172a;
    width: 48mm;
    white-space: nowrap;
    padding-right: 8px;
  }}
  .skills-table td.label::after {{ content: ":"; }}
  .project {{ margin-bottom: 5px; }}
  .project:last-child {{ margin-bottom: 0; }}
  .project-header {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }}
  .project-name {{
    font-size: 9pt;
    font-weight: 700;
    color: #0f172a;
  }}
  .project-tools {{
    font-size: 8pt;
    color: #475569;
    font-style: italic;
    white-space: nowrap;
    margin-left: 8px;
  }}
  .project-desc {{
    font-size: 8.5pt;
    color: #1e293b;
    margin-top: 1px;
  }}
  .edu-item {{ margin-bottom: 4px; }}
  .edu-degree {{
    font-size: 9pt;
    font-weight: 700;
    color: #0f172a;
  }}
  .edu-inst {{
    font-size: 8.5pt;
    color: #334155;
    font-style: italic;
  }}
  .lang-item {{
    font-size: 8.6pt;
    color: #1e293b;
    margin-bottom: 2px;
  }}
  .courses-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 14px;
  }}
  .course {{
    font-size: 8.2pt;
    color: #1e293b;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 1px 0;
    border-bottom: 1px solid #f1f5f9;
  }}
  .course-date {{
    color: #64748b;
    font-size: 7.8pt;
    white-space: nowrap;
    margin-left: 6px;
  }}
</style>
</head>
<body>
<div class="header">
  <h1>{name}</h1>
  <div class="tagline">{tagline}</div>
  <div class="contacts">
    <span>{location}</span>
    <span>• {email}</span>
    <span>• {phone}</span>
    <span>• {linkedin}</span>
    <span>• {portal_url}</span>
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
  <table class="skills-table">
    {skills_html}
  </table>
</div>

<div class="section">
  <div class="section-title">{lbl_projects}</div>
  {projects_html}
</div>

<table style="width:100%; border-collapse:collapse; margin-top:9px;">
<tr style="vertical-align:top;">
  <td style="width:58%; padding-right:12px;">
    <div class="section-title">{lbl_education}</div>
    {education_html}
  </td>
  <td style="width:42%;">
    <div class="section-title">{lbl_lang}</div>
    {languages_html}
  </td>
</tr>
</table>

<div class="section">
  <div class="section-title">{lbl_courses}</div>
  <div class="courses-grid">
    {courses_html}
  </div>
</div>
</body>
</html>"""


def render_skills(skills: dict, lang: str) -> str:
    skill_map = LABELS[lang]["skills_map"]
    rows = []
    for key, label in skill_map.items():
        if key not in skills:
            continue
        items = ", ".join(_esc(s) for s in skills[key])
        rows.append(f'<tr><td class="label">{label}</td><td>{items}</td></tr>')
    return "\n".join(rows)


def render_experience(jobs: list, lang: str) -> str:
    parts = []
    for job in jobs:
        title = _t(job, "title", lang)
        period = job.get("period_en") if lang == "en" and job.get("period_en") else job["period"]
        bullets = job.get(f"bullets_{lang}") or job.get("bullets", [])
        bullet_html = "".join(f"<li>{_esc(b)}</li>" for b in bullets)
        parts.append(
            f'<div class="job">'
            f'<div class="job-header">'
            f'<span class="job-title">{_esc(title)}</span>'
            f'<span class="job-date">{_esc(period)}</span>'
            f"</div>"
            f'<div class="job-sub">'
            f'<span class="job-company">{_esc(job["company"])} — {_esc(job["location"])}</span>'
            f"</div>"
            f"<ul>{bullet_html}</ul>"
            f"</div>"
        )
    return "\n".join(parts)


def render_projects(projects: list, lang: str) -> str:
    lbl_tools = LABELS[lang]["tools"]
    parts = []
    for p in projects[:4]:
        name = _t(p, "name", lang)
        desc = _t(p, "description", lang).strip()
        tools = ", ".join(_esc(t) for t in p.get("tools", []))
        parts.append(
            f'<div class="project">'
            f'<div class="project-header">'
            f'<span class="project-name">{_esc(name)}</span>'
            f'<span class="project-tools">{lbl_tools}: {tools}</span>'
            f"</div>"
            f'<div class="project-desc">{_esc(desc)}</div>'
            f"</div>"
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
            f"</div>"
        )
    return "\n".join(parts)


def render_languages(langs: list, lang: str = "es") -> str:
    items = []
    for l in langs:
        name = l.get("lang_en") if lang == "en" and l.get("lang_en") else l["lang"]
        lvl = l.get("level_en") if lang == "en" and l.get("level_en") else l["level"]
        items.append(f'<div class="lang-item"><strong>{_esc(name)}</strong> — {_esc(lvl)}</div>')
    return "".join(items)


def render_courses(courses: list) -> str:
    parts = []
    for c in courses:
        date = _esc(c["date"]) if c.get("date") else ""
        parts.append(
            f'<div class="course">'
            f'<span class="course-name">{_esc(c["name"])}</span>'
            f'<span class="course-date">{date}</span>'
            f"</div>"
        )
    return "\n".join(parts)


def generate_pdf(data: dict, lang: str, output_path: Path) -> bool:
    try:
        from weasyprint import HTML
    except Exception as exc:
        print(f"[WARN] WeasyPrint not available in current OS environment ({exc}); skipping local PDF write for {output_path.name}.")
        return False

    lbl = LABELS[lang]
    meta = data["meta"]
    location = meta.get(f"location_{lang}") or meta.get("location_es", "Colombia")

    html = HTML_TEMPLATE.format(
        lang_code=lang,
        name=_esc(meta["name"]),
        tagline=_esc(meta[f"tagline_{lang}"]),
        location=_esc(location),
        email=_esc(meta["email"]),
        phone=_esc(meta["phone"]),
        linkedin=_esc(meta["linkedin"]),
        portal_url=_esc(meta.get("portal_url", "")),
        lbl_summary=lbl["summary"],
        lbl_experience=lbl["experience"],
        lbl_skills=lbl["skills"],
        lbl_projects=lbl["projects"],
        lbl_education=lbl["education"],
        lbl_lang=lbl["lang"],
        lbl_courses=lbl["courses"],
        summary=_esc(data[f"summary_{lang}"].strip()),
        experience_html=render_experience(data["experience"], lang),
        skills_html=render_skills(data["skills"], lang),
        projects_html=render_projects(data["projects"], lang),
        education_html=render_education(data["education"], lang),
        languages_html=render_languages(data["spoken_languages"], lang),
        courses_html=render_courses(data["courses"]),
    )

    HTML(string=html, base_url=str(ROOT)).write_pdf(str(output_path))
    print(f"[OK] Generated PDF: {output_path.relative_to(ROOT)}")
    return True


def export_portal_json(data: dict, github_repos: list, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "cv": data,
        "github_repos": github_repos,
    }
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[OK] Exported Portal Data: {output_path.relative_to(ROOT)}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    yaml_path = ROOT / "cv_data.yaml"
    readme_path = ROOT / "README.md"
    banner_path = ROOT / "assets" / "banner.svg"
    portal_json_path = ROOT / "portal" / "src" / "data" / "generated_profile.json"

    if not yaml_path.exists():
        print(f"ERROR: {yaml_path} not found.", file=sys.stderr)
        sys.exit(1)

    with open(yaml_path, encoding="utf-8") as f:
        data = yaml.safe_load(f)

    # 1. Generate Dynamic Cover Banner SVG
    banner_path.parent.mkdir(parents=True, exist_ok=True)
    banner_svg = render_banner_svg(data)
    banner_path.write_text(banner_svg, encoding="utf-8")
    print(f"[OK] Generated Cover Banner: {banner_path.relative_to(ROOT)}")

    # 2. Fetch live GitHub repositories
    username = data["meta"].get("github_username", "santiloc-hub")
    live_repos = fetch_github_repos(username=username, limit=8)

    # 3. Generate Executive README.md
    readme_md = render_readme(data, live_repos)
    readme_path.write_text(readme_md, encoding="utf-8")
    print(f"[OK] Generated README: {readme_path.relative_to(ROOT)}")

    # 4. Export JSON payload for the Astro + React Experience Portal
    export_portal_json(data, live_repos, portal_json_path)

    # 5. Generate PDFs if WeasyPrint is installed
    generate_pdf(data, "en", ROOT / "CV_EN.pdf")
    generate_pdf(data, "es", ROOT / "CV_ES.pdf")
    if (ROOT / "CV_ES.pdf").exists():
        (ROOT / "CV.pdf").write_bytes((ROOT / "CV_ES.pdf").read_bytes())

    print("\nDone! All artifacts synchronized from cv_data.yaml.")
