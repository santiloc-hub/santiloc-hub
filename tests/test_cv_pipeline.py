import sys
import unittest
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

import generate_cv  # noqa: E402


class TestCVPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        yaml_path = ROOT / "cv_data.yaml"
        with open(yaml_path, encoding="utf-8") as f:
            cls.cv_data = yaml.safe_load(f)

    def test_cv_data_has_enriched_experience_and_skills(self):
        meta = self.cv_data["meta"]
        self.assertIn("portal_url", meta)
        self.assertIn("platzi", meta)
        self.assertIn("github", meta)

        all_skills_text = " ".join(
            skill for cat in self.cv_data["skills"].values() for skill in cat
        )
        for expected in ["Terraform", "FastAPI", "MLflow", "Monte Carlo", "MCP"]:
            self.assertIn(
                expected,
                all_skills_text,
                f"Missing {expected} in cv_data.yaml skills",
            )

        for job in self.cv_data["experience"]:
            self.assertIn("tags", job)
            self.assertGreaterEqual(len(job["tags"]), 3)

    def test_render_banner_svg_produces_valid_dynamic_cover_with_obsidian_gold_palette(self):
        self.assertTrue(
            hasattr(generate_cv, "render_banner_svg"),
            "render_banner_svg not defined",
        )
        svg = generate_cv.render_banner_svg(self.cv_data)
        self.assertTrue(svg.strip().startswith("<svg"))
        self.assertIn('viewBox="0 0 1280 380"', svg)
        self.assertIn("Santiago Montaña", svg)
        self.assertIn("#ffd98e", svg.lower())
        self.assertIn("#0f0e0e", svg.lower())
        self.assertIn("CIM DATA IA", svg)
        self.assertIn("Terraform", svg)
        self.assertIn("Snowflake", svg)
        self.assertIn("</svg>", svg)

    def test_render_readme_includes_banner_portal_experience_and_clean_activity(self):
        self.assertTrue(
            hasattr(generate_cv, "render_readme"),
            "render_readme not defined",
        )
        sample_repos = [
            {
                "name": "news_agent",
                "html_url": "https://github.com/santiloc-hub/news_agent",
                "description": "Agente autónomo de noticias con IA",
                "language": "Python",
                "updated_at": "2026-10-21T19:23:05Z",
            },
            {
                "name": "Proyecto_TRM_Dolar",
                "html_url": "https://github.com/santiloc-hub/Proyecto_TRM_Dolar",
                "description": "Predicción de TRM con sentimiento y Monte Carlo",
                "language": "Jupyter Notebook",
                "updated_at": "2026-05-08T18:52:40Z",
            },
        ]
        readme = generate_cv.render_readme(self.cv_data, sample_repos)
        self.assertIn("./assets/banner.svg", readme)
        self.assertIn(self.cv_data["meta"]["portal_url"], readme)
        self.assertIn("./CV_ES.pdf", readme)
        self.assertIn("./CV_EN.pdf", readme)
        self.assertIn("CIM DATA IA", readme)
        self.assertIn("HOLCIM S.A.", readme)
        self.assertIn("news_agent", readme)
        self.assertNotIn("undefined commit", readme)

    def test_render_education_includes_graduation_period(self):
        edu_sample = [
            {
                "degree_es": "Especialización en Analítica Estratégica de Datos",
                "degree_en": "Specialization in Strategic Data Analytics",
                "institution": "Universidad Pedagógica y Tecnológica de Colombia (UPTC)",
                "period": "Posgrado · 2025",
                "period_en": "Graduate Specialization · 2025",
            }
        ]
        html_es = generate_cv.render_education(edu_sample, "es")
        html_en = generate_cv.render_education(edu_sample, "en")
        self.assertIn("2025", html_es)
        self.assertIn("2025", html_en)

    def test_build_resume_html_renders_complete_document(self):
        html_es = generate_cv.build_resume_html(self.cv_data, "es")
        html_en = generate_cv.build_resume_html(self.cv_data, "en")
        self.assertIn("<!DOCTYPE html>", html_es)
        self.assertIn("+20%", html_es)
        self.assertIn("Graduado 2025", html_es)
        self.assertIn("Graduated 2025", html_en)

    def test_recruiter_hardened_cv_profile(self):
        # 1. Primary current title should not self-demote with "Junior"
        current_job = self.cv_data["experience"][0]
        self.assertNotIn("Junior", current_job["title_es"])
        self.assertNotIn("Junior", current_job["title_en"])

        # 2. Every experience entry must have quantitative metrics (% or +) in bullets
        for job in self.cv_data["experience"]:
            es_joined = " ".join(job["bullets_es"])
            en_joined = " ".join(job["bullets_en"])
            self.assertTrue(
                "%" in es_joined or "+" in es_joined,
                f"Missing quantitative metric in bullets_es for {job['id']}",
            )
            self.assertTrue(
                "%" in en_joined or "+" in en_joined,
                f"Missing quantitative metric in bullets_en for {job['id']}",
            )

        # 3. Orphaned skills must be removed
        all_skills_text = " ".join(
            skill for cat in self.cv_data["skills"].values() for skill in cat
        )
        for orphan in ["PyTorch", "TensorFlow", "C++"]:
            self.assertNotIn(orphan, all_skills_text)

        # 4. Education entries must have explicit graduation years (2024, 2025)
        edu_periods = " ".join(e.get("period", "") for e in self.cv_data["education"])
        self.assertIn("2025", edu_periods)
        self.assertIn("2024", edu_periods)

        # 5. Introductory courses that juniorize the profile must be removed
        course_names = " ".join(c["name"] for c in self.cv_data["courses"])
        for basic_course in [
            "Cálculo Diferencial",
            "Estadística Descriptiva",
            "Jupyter Notebooks y Anaconda",
            "Introducción a Machine Learning",
        ]:
            self.assertNotIn(basic_course, course_names)

        # 6. English level should not include self-limiting reading-only caveat
        en_lang = [
            l for l in self.cv_data["spoken_languages"] if "Ingl" in l["lang"]
        ][0]
        self.assertNotIn("para lectura", en_lang["level"])
        self.assertNotIn("reading", en_lang["level_en"])


if __name__ == "__main__":
    unittest.main()
