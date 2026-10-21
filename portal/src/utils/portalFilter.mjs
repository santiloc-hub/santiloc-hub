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

export function getArchitectureBlueprints(lang = "es") {
  const isEs = lang === "es";
  return [
    {
      id: "pipelines",
      label: isEs ? "Data & ML Pipelines" : "Data & ML Pipelines",
      badge: "PRODUCTION DAGs",
      status: isEs ? "Orquestación ELT & Validación Cuantitativa" : "ELT Orchestration & Quantitative Validation",
      nodes: [
        { step: "01", title: "Ingestion & ELT", tech: "Meltano · Python · APIs", metric: "Raw -> Stage" },
        { step: "02", title: "Cloud Warehouse", tech: "Snowflake · dbt SQL", metric: "Dimensional Models" },
        { step: "03", title: "Orchestration", tech: "Apache Airflow · CI/CD", metric: "Automated DAGs" },
        { step: "04", title: "ML & Simulation", tech: "Scikit-learn · Monte Carlo · MLflow", metric: "Stress-Tested" },
      ],
      codeSnippet: `dag = AirflowDAG("cim_snowflake_ml_pipeline", schedule="@daily")
ingest >> dbt_transform >> monte_carlo_validation >> mlflow_register`,
    },
    {
      id: "agents",
      label: isEs ? "Agentes IA & MCP" : "AI Agents & MCP",
      badge: "AUTONOMOUS AI",
      status: isEs ? "Protocolo MCP, LLMs & Asistentes de Voz" : "MCP Protocol, LLMs & Voice Assistants",
      nodes: [
        { step: "01", title: "LLM Reasoning Core", tech: "Claude · OpenAI · Prompts", metric: "Context-Aware" },
        { step: "02", title: "MCP Tooling Layer", tech: "Model Context Protocol", metric: "Multi-System I/O" },
        { step: "03", title: "Voice & Banking UX", tech: "ElevenLabs · NLP Chatbots", metric: "Low-Latency" },
        { step: "04", title: "Serving API", tech: "FastAPI · Pydantic · Tests", metric: "Production Ready" },
      ],
      codeSnippet: `agent = MCPAutonomousAgent(llm="claude", tools=[aws_iac, snowflake_query])
await agent.execute_workflow(voice_stream=elevenlabs_channel)`,
    },
    {
      id: "cloud",
      label: isEs ? "Cloud & Terraform IaC" : "Cloud & Terraform IaC",
      badge: "INFRASTRUCTURE AS CODE",
      status: isEs ? "Aprovisionamiento Reproducible en AWS" : "Reproducible Provisioning on AWS",
      nodes: [
        { step: "01", title: "Declarative IaC", tech: "Terraform · HCL Modules", metric: "100% Versioned" },
        { step: "02", title: "Cloud Compute & Storage", tech: "AWS EC2 · S3 · IAM", metric: "Least-Privilege" },
        { step: "03", title: "Runtime Isolation", tech: "Docker · Anaconda · virtualenv", metric: "Portable Envs" },
        { step: "04", title: "Continuous Delivery", tech: "GitHub Actions · Automated QA", metric: "Zero-Drift" },
      ],
      codeSnippet: `module "data_platform_aws" {
  source      = "./modules/aws-snowflake-airflow"
  environment = "production"
  enable_iac  = true
}`,
    },
  ];
}
