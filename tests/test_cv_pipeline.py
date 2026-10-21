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

    def test_render_banner_svg_produces_valid_dynamic_cover(self):
        self.assertTrue(
            hasattr(generate_cv, "render_banner_svg"),
            "render_banner_svg not defined",
        )
        svg = generate_cv.render_banner_svg(self.cv_data)
        self.assertTrue(svg.strip().startswith("<svg"))
        self.assertIn('viewBox="0 0 1280 380"', svg)
        self.assertIn("Santiago Montaña", svg)
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


if __name__ == "__main__":
    unittest.main()
