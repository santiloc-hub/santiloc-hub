export function getLocalizedText(obj, baseKey, lang = "es") {
  if (!obj) return "";
  return obj[`${baseKey}_${lang}`] ?? obj[baseKey] ?? "";
}

export function filterSkillsByCategoryAndQuery(skillsObj, activeCategory = "all", query = "") {
  const normalizedQuery = (query || "").trim().toLowerCase();
  const entries = Object.entries(skillsObj || {});

  return entries
    .filter(([cat]) => activeCategory === "all" || cat === activeCategory)
    .map(([category, items]) => {
      const filteredItems = normalizedQuery
        ? items.filter(
            (item) =>
              item.toLowerCase().includes(normalizedQuery) ||
              category.toLowerCase().includes(normalizedQuery)
          )
        : items;
      return { category, items: filteredItems };
    })
    .filter((entry) => entry.items.length > 0);
}

export function filterExperienceByTag(experienceList, selectedTag = "ALL") {
  if (!Array.isArray(experienceList)) return [];
  if (!selectedTag || selectedTag === "ALL") return experienceList;
  const target = selectedTag.toLowerCase();
  return experienceList.filter((job) =>
    (job.tags || []).some((t) => t.toLowerCase() === target)
  );
}
