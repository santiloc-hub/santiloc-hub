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

export function getCapabilitiesPillars(lang = "es") {
  if (lang === "en") {
    return [
      {
        number: "01",
        title: "Data Engineering & Cloud Pipelines",
        description:
          "I architect and orchestrate resilient ETL/ELT pipelines designed for reliability at scale. From raw ingestion with Meltano and Python to dimensional modeling in Snowflake with dbt and Apache Airflow.",
        tags: ["Snowflake", "Apache Airflow", "dbt", "Meltano", "SQL"],
      },
      {
        number: "02",
        title: "Predictive Modeling & Monte Carlo Simulation",
        description:
          "I build classification ensembles, forecasting models, and quantitative Monte Carlo stress tests that turn complex operational uncertainty into measurable, data-driven decisions.",
        tags: ["Scikit-learn", "Random Forest", "XGBoost", "Monte Carlo", "SciPy"],
      },
      {
        number: "03",
        title: "Conversational AI & Autonomous MCP Agents",
        description:
          "I design and deploy LLM-powered autonomous agents integrating the Model Context Protocol (MCP), banking chatbots, and low-latency ElevenLabs voice assistants connected to real enterprise systems.",
        tags: ["Model Context Protocol (MCP)", "LLMs", "ElevenLabs", "NLP", "Autonomous Agents"],
      },
      {
        number: "04",
        title: "Cloud Infrastructure as Code (AWS & Terraform)",
        description:
          "I provision reproducible, secure cloud infrastructure on AWS (EC2, S3, IAM) using declarative Terraform modules and isolated runtime environments that eliminate configuration drift.",
        tags: ["Terraform (IaC)", "AWS EC2 / S3 / IAM", "Docker", "Anaconda", "CI/CD"],
      },
      {
        number: "05",
        title: "MLOps & Production Microservices",
        description:
          "I bridge the gap between notebooks and production by packaging machine learning models into validated FastAPI services with Pydantic schemas, automated test suites, and MLflow tracking.",
        tags: ["FastAPI", "Pydantic", "MLflow", "GitHub Actions", "Automated Testing"],
      },
      {
        number: "06",
        title: "Operational Analytics & Executive BI",
        description:
          "I partner with operations, industrial plants, and leadership teams to translate raw telemetry into executive KPI dashboards in Looker Studio, Power BI, and Tableau.",
        tags: ["Looker Studio", "Power BI", "Tableau", "Industrial KPIs", "Data Storytelling"],
      },
    ];
  }

  return [
    {
      number: "01",
      title: "Data Engineering & Cloud Pipelines",
      description:
        "Diseño y orquesto pipelines ETL/ELT resilientes construidos para escalar. Desde la extracción con Meltano y Python hasta el modelado dimensional en Snowflake con dbt y Apache Airflow.",
      tags: ["Snowflake", "Apache Airflow", "dbt", "Meltano", "SQL"],
    },
    {
      number: "02",
      title: "Modelado Predictivo & Simulación Monte Carlo",
      description:
        "Construyo algoritmos de clasificación, ensambles predictivos y simulaciones cuantitativas de Monte Carlo para probar la eficacia del diseño de datos y anticipar escenarios operativos.",
      tags: ["Scikit-learn", "Random Forest", "XGBoost", "Monte Carlo", "SciPy"],
    },
    {
      number: "03",
      title: "IA Conversacional & Agentes Autónomos MCP",
      description:
        "Desarrollo agentes autónomos e integraciones con Model Context Protocol (MCP), chatbots bancarios de alta precisión y asistentes de voz en tiempo real con Python y ElevenLabs.",
      tags: ["Model Context Protocol (MCP)", "LLMs", "ElevenLabs", "NLP", "Agentes Autónomos"],
    },
    {
      number: "04",
      title: "Cloud Infrastructure as Code (AWS & Terraform)",
      description:
        "Aprovisiono y despliego infraestructura reproducible en la nube de AWS (EC2, S3, IAM) mediante Terraform (IaC) y contenedores, garantizando entornos portables y gobernados bajo CI/CD.",
      tags: ["Terraform (IaC)", "AWS EC2 / S3 / IAM", "Docker", "Anaconda", "CI/CD"],
    },
    {
      number: "05",
      title: "MLOps & Microservicios en Producción",
      description:
        "Llevo los modelos del experimento a producción empaquetándolos en APIs REST con FastAPI, validación estricta con Pydantic, pruebas automatizadas y tracking de experimentos con MLflow.",
      tags: ["FastAPI", "Pydantic", "MLflow", "GitHub Actions", "Testing"],
    },
    {
      number: "06",
      title: "Analítica Operativa & Executive BI",
      description:
        "Conecto la ingeniería de datos con las gerencias de operaciones y planta industrial, transformando datos crudos en tableros ejecutivos de KPIs en Looker Studio, Power BI y Tableau.",
      tags: ["Looker Studio", "Power BI", "Tableau", "KPIs Industriales", "Storytelling"],
    },
  ];
}
