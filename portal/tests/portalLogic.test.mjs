import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  filterSkillsByCategoryAndQuery,
  filterExperienceByTag,
  getLocalizedText,
  getArchitectureBlueprints,
  getCapabilitiesPillars,
} from "../src/utils/portalFilter.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const profileJsonPath = path.resolve(__dirname, "../src/data/generated_profile.json");

test("generated_profile.json contains valid CV and live GitHub repos", () => {
  assert.equal(fs.existsSync(profileJsonPath), true);
  const raw = JSON.parse(fs.readFileSync(profileJsonPath, "utf-8"));
  assert.equal(raw.cv.meta.name, "Santiago Montaña");
  assert.ok(Array.isArray(raw.cv.experience));
  assert.ok(raw.cv.experience.length >= 3);
  assert.ok(Array.isArray(raw.github_repos));
});

test("filterSkillsByCategoryAndQuery filters by category and search term", () => {
  const raw = JSON.parse(fs.readFileSync(profileJsonPath, "utf-8"));
  const allCloud = filterSkillsByCategoryAndQuery(raw.cv.skills, "cloud_devops", "");
  assert.equal(allCloud.length, 1);
  assert.equal(allCloud[0].category, "cloud_devops");
  assert.ok(allCloud[0].items.some((s) => s.includes("Terraform")));

  const searchMcp = filterSkillsByCategoryAndQuery(raw.cv.skills, "all", "mcp");
  assert.equal(searchMcp.length, 1);
  assert.equal(searchMcp[0].category, "conversational_ai");
});

test("filterExperienceByTag returns matching experience roles", () => {
  const raw = JSON.parse(fs.readFileSync(profileJsonPath, "utf-8"));
  const allRoles = filterExperienceByTag(raw.cv.experience, "ALL");
  assert.equal(allRoles.length, 3);

  const terraformRoles = filterExperienceByTag(raw.cv.experience, "Terraform (IaC)");
  assert.equal(terraformRoles.length, 1);
  assert.equal(terraformRoles[0].id, "cim-jr-ds");
});

test("getLocalizedText switches cleanly between ES and EN", () => {
  const sample = { title_es: "Científico de Datos", title_en: "Data Scientist" };
  assert.equal(getLocalizedText(sample, "title", "es"), "Científico de Datos");
  assert.equal(getLocalizedText(sample, "title", "en"), "Data Scientist");
});

test("getCapabilitiesPillars returns 6 editorial pillars in Jake Sinclair style", () => {
  const pillarsEs = getCapabilitiesPillars("es");
  const pillarsEn = getCapabilitiesPillars("en");
  assert.equal(pillarsEs.length, 6);
  assert.equal(pillarsEn.length, 6);
  assert.equal(pillarsEs[0].number, "01");
  assert.ok(pillarsEs[0].title.length > 5);
  assert.ok(pillarsEs[0].description.length > 20);
  assert.ok(Array.isArray(pillarsEs[0].tags));
});
