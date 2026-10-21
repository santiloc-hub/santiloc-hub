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

test("getArchitectureBlueprints returns 3 interactive telemetry blueprints for Hero panel", () => {
  const blueprintsEs = getArchitectureBlueprints("es");
  assert.equal(blueprintsEs.length, 3);
  assert.equal(blueprintsEs[0].id, "pipelines");
  assert.equal(blueprintsEs[1].id, "agents");
  assert.equal(blueprintsEs[2].id, "cloud");
  assert.ok(blueprintsEs[0].nodes.length >= 4);
});
