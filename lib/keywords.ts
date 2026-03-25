export interface KeywordMap {
  required: string[];
  preferred: string[];
  technical: string[];
  soft: string[];
  jobTitle: string;
  company: string;
}

export type MatchStatus = "found" | "implicit" | "missing";

export interface KeywordMatch {
  keyword: string;
  type: "required" | "preferred" | "technical" | "soft";
  status: MatchStatus;
  matchedVia?: string;
}

// ── Synonym / abbreviation map ────────────────────────────────────────────────
// Keys are canonical lowercase terms; values are aliases that count as a match
const SYNONYMS: Record<string, string[]> = {
  // ── Technical ──────────────────────────────────────────────────────────────
  javascript: ["js", "jsx", "es6", "es2015", "ecmascript", "node.js", "nodejs", "vue.js", "react.js", "next.js", "nextjs", "angular.js"],
  typescript: ["ts", "tsx"],
  python: ["py", "python3", "python2", "django", "flask", "fastapi", "pandas", "numpy", "scipy"],
  "machine learning": ["ml", "deep learning", "neural network", "sklearn", "scikit-learn", "tensorflow", "pytorch", "keras", "xgboost", "cv", "computer vision", "nlp", "natural language processing"],
  "artificial intelligence": ["ai", "ml", "machine learning", "deep learning", "llm", "gpt"],
  kubernetes: ["k8s", "container orchestration", "helm", "argo"],
  docker: ["containerization", "containers", "dockerfile", "compose", "container"],
  "ci/cd": ["continuous integration", "continuous deployment", "continuous delivery", "jenkins", "github actions", "gitlab ci", "circleci", "travis ci", "devops", "pipeline"],
  devops: ["ci/cd", "continuous integration", "infrastructure", "sre", "site reliability", "platform engineering"],
  database: ["db", "sql", "nosql", "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch", "dynamodb", "sqlite", "aurora"],
  postgresql: ["postgres", "psql", "pg"],
  mongodb: ["mongo", "nosql", "document store"],
  redis: ["cache", "caching", "in-memory"],
  rest: ["restful", "rest api", "http", "web services", "endpoint"],
  graphql: ["gql", "apollo", "graph api"],
  api: ["rest", "restful", "web services", "http", "endpoints", "microservices", "integration", "sdk"],
  aws: ["amazon web services", "ec2", "s3", "lambda", "cloudformation", "rds", "ecs", "eks", "sqs", "sns", "cloudfront", "iam"],
  azure: ["microsoft azure", "azure devops", "azure functions"],
  gcp: ["google cloud", "google cloud platform", "bigquery", "cloud run"],
  cloud: ["aws", "azure", "gcp", "serverless", "infrastructure", "iaas", "paas"],
  agile: ["scrum", "kanban", "sprint", "standup", "retrospective", "jira", "confluence", "story points"],
  scrum: ["agile", "sprint", "standup", "backlog"],
  react: ["reactjs", "react.js", "next.js", "nextjs", "gatsby", "remix"],
  vue: ["vuejs", "vue.js", "nuxt"],
  angular: ["angularjs", "ng", "rxjs"],
  node: ["nodejs", "node.js", "express", "expressjs", "fastify", "hapi"],
  sql: ["database", "postgresql", "mysql", "sqlite", "mssql", "t-sql", "pl/sql", "query", "schema", "orm"],
  git: ["github", "gitlab", "bitbucket", "version control", "source control", "branching", "pull request"],
  linux: ["unix", "bash", "shell", "ubuntu", "debian", "centos", "rhel", "cli"],
  java: ["spring", "spring boot", "maven", "gradle", "jvm", "hibernate"],
  "c#": ["dotnet", ".net", "asp.net", "csharp", "entity framework"],
  golang: ["go", "go language", "goroutine"],
  html: ["html5", "markup", "semantic html", "web"],
  css: ["css3", "sass", "scss", "less", "tailwind", "bootstrap", "styled-components", "flexbox", "grid"],
  "data analysis": ["analytics", "data science", "tableau", "power bi", "excel", "pandas", "numpy", "matplotlib", "looker", "bi"],
  "project management": ["pm", "program management", "pmp", "prince2", "roadmap", "delivery", "managed project", "coordinated"],
  testing: ["unit testing", "integration testing", "e2e", "jest", "pytest", "mocha", "cypress", "selenium", "qa", "quality assurance", "tdd", "bdd"],
  microservices: ["service mesh", "api gateway", "distributed systems", "event-driven", "kafka", "rabbitmq"],
  security: ["cybersecurity", "oauth", "jwt", "authentication", "authorization", "ssl", "tls", "encryption", "infosec"],
  terraform: ["infrastructure as code", "iac", "ansible", "pulumi"],
  "infrastructure as code": ["terraform", "iac", "ansible", "pulumi", "cloudformation"],
  monitoring: ["observability", "prometheus", "grafana", "datadog", "new relic", "logging", "alerting"],
  kafka: ["event streaming", "message queue", "pub/sub", "rabbitmq", "sqs"],
  "data engineering": ["etl", "pipeline", "airflow", "spark", "hadoop", "data warehouse", "dbt"],
  figma: ["ui design", "ux design", "prototyping", "wireframing", "design system"],
  "product management": ["product owner", "roadmap", "user stories", "backlog", "product strategy"],

  // ── Soft Skills — broad, verb-form, and noun-form variations ───────────────
  communication: [
    "communicated", "communicating", "communicates", "communicate",
    "written communication", "verbal communication", "presentation", "presentations",
    "stakeholder", "stakeholders", "messaging", "conveyed", "conveying",
    "articulated", "articulating", "briefed", "briefing", "reported", "reporting",
    "documented", "documenting", "explained", "explaining",
  ],
  collaboration: [
    "collaborated", "collaborating", "collaborates", "collaborate",
    "team player", "cross-functional", "cross functional", "teamwork",
    "cooperated", "cooperating", "partnered", "partnering",
    "worked with", "worked alongside", "joint", "jointly",
  ],
  leadership: [
    "led", "lead", "leads", "leader", "leading",
    "team lead", "tech lead", "engineering manager", "people management",
    "mentoring", "mentored", "coaching", "coached",
    "managed", "managing", "headed", "directed", "directing",
    "oversaw", "oversee", "overseeing", "supervised", "supervising",
    "guided", "guiding", "spearheaded", "drove", "driving",
  ],
  adaptability: [
    "adapted", "adapting", "adapts", "adapt",
    "flexible", "flexibility", "versatile", "versatility",
    "pivoted", "pivoting", "adjusted", "adjusting",
    "thrived in ambiguity", "fast-moving", "dynamic environment",
  ],
  "problem-solving": [
    "problem solving", "troubleshot", "troubleshoot", "troubleshooting",
    "diagnosed", "diagnosing", "resolved", "resolving", "resolution",
    "debugged", "debugging", "analyzed", "analyzing", "analysis",
    "investigated", "investigating", "root cause", "solutions",
    "identified issues", "fixed", "fixing",
  ],
  "problem solving": [
    "problem-solving", "troubleshot", "troubleshoot", "troubleshooting",
    "diagnosed", "resolving", "resolution", "debugged", "analyzed",
  ],
  "attention to detail": [
    "detail-oriented", "detail oriented", "meticulous", "thorough",
    "precise", "precision", "accuracy", "accurate", "careful", "carefully",
    "reviewed", "reviewing", "quality", "rigorous",
  ],
  analytical: [
    "analysis", "analyzed", "analyzing", "data-driven", "data driven",
    "metrics", "insights", "quantitative", "qualitative", "evaluated",
    "evaluating", "assessment", "assessed", "research", "researched",
  ],
  "cross-functional": [
    "cross functional", "cross-team", "cross team", "stakeholder",
    "collaborated across", "worked across", "multiple teams", "interdisciplinary",
    "partnered with", "coordinated with", "interfaced with",
  ],
  mentoring: [
    "mentored", "mentor", "coaching", "coached", "trained", "training",
    "guided", "onboarded", "onboarding", "developed team", "knowledge transfer",
    "junior", "interns", "new hires",
  ],
  "time management": [
    "prioritized", "prioritizing", "deadlines", "deadline", "on time",
    "scheduling", "schedule", "managed time", "delivered on time",
    "met deadlines", "organized", "organizing",
  ],
  ownership: [
    "owned", "owning", "responsible for", "accountable", "end-to-end",
    "full ownership", "drove", "spearheaded", "took initiative", "initiative",
    "self-directed", "independently",
  ],
  innovation: [
    "innovated", "innovative", "created", "built", "developed", "designed",
    "invented", "conceived", "ideated", "brainstormed", "pioneered",
    "introduced", "launched", "shipped", "released",
  ],
  "stakeholder management": [
    "stakeholder", "stakeholders", "client", "clients", "executive",
    "communicated with", "presented to", "reported to", "briefed",
    "business partner", "business partners",
  ],
  "communication skills": [
    "communicated", "communicating", "written", "verbal", "presentations",
    "stakeholder", "articulated", "documented", "reported",
  ],
  teamwork: [
    "team", "collaborated", "cross-functional", "cooperated", "partnered",
    "joint", "collective", "together", "group",
  ],
  "critical thinking": [
    "analyzed", "evaluated", "assessed", "reasoned", "logical",
    "data-driven", "evidence-based", "research", "insights",
  ],
  creativity: [
    "created", "designed", "built", "invented", "devised", "crafted",
    "innovative", "novel", "original", "ideated", "brainstormed",
  ],
  initiative: [
    "initiated", "self-directed", "proactive", "drove", "independently",
    "took ownership", "without being asked", "identified opportunity",
  ],
  "decision making": [
    "decided", "decision", "prioritized", "chose", "selected",
    "evaluated options", "trade-offs", "tradeoffs", "judgment",
  ],
  organization: [
    "organized", "organizing", "structured", "coordinated", "managed",
    "tracked", "maintained", "documented", "systematic",
  ],
};

// Build reverse lookup: alias → canonical
const REVERSE_SYNONYMS: Record<string, string[]> = {};
for (const [canonical, aliases] of Object.entries(SYNONYMS)) {
  for (const alias of aliases) {
    if (!REVERSE_SYNONYMS[alias]) REVERSE_SYNONYMS[alias] = [];
    REVERSE_SYNONYMS[alias].push(canonical);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const STOP_WORDS = new Set(["and", "the", "for", "with", "using", "via", "or", "in", "on", "at", "to", "of", "a", "an"]);

function stem(word: string): string {
  let w = word.toLowerCase().trim();
  // Apply exactly ONE suffix rule (most specific first) then strip trailing 'e'
  // so "communication" → "communicat" and "communicated" → "communicat" both match
  if (w.endsWith("ications") || w.endsWith("ication"))  w = w.replace(/ications?$/, "ic");
  else if (w.endsWith("ations") || w.endsWith("ation")) w = w.replace(/ations?$/, "");
  else if (w.endsWith("nesses") || w.endsWith("ness"))  w = w.replace(/nesses?$/, "");
  else if (w.endsWith("ities") || w.endsWith("ity"))    w = w.replace(/iti(?:es|y)$/, "");
  else if (w.endsWith("ments") || w.endsWith("ment"))   w = w.replace(/ments?$/, "");
  else if (w.endsWith("tions") || w.endsWith("tion"))   w = w.replace(/tions?$/, "");
  else if (w.endsWith("ings") || w.endsWith("ing"))     w = w.replace(/ings?$/, "");
  else if (w.endsWith("ers") || w.endsWith("er"))       w = w.replace(/ers?$/, "");
  else if (w.endsWith("est"))                           w = w.replace(/est$/, "");
  else if (w.endsWith("ed"))                            w = w.replace(/ed$/, "");
  else if (w.endsWith("ly"))                            w = w.replace(/ly$/, "");
  else if (w.endsWith("s") && !w.endsWith("ss") && w.length > 4) w = w.replace(/s$/, "");
  // Strip trailing 'e' for normalisation (communicate → communicat)
  if (w.endsWith("e") && w.length > 4) w = w.slice(0, -1);
  return w;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9#.+/\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function checkCoverage(keyword: string, textTokens: string[], rawText: string): MatchStatus {
  const kwLower = keyword.toLowerCase().trim();
  const rawLower = rawText.toLowerCase();

  // 1. Direct substring match
  if (rawLower.includes(kwLower)) return "found";

  // 2. Known synonyms of this keyword appear in text
  const kwSynonyms = SYNONYMS[kwLower] ?? [];
  if (kwSynonyms.some((syn) => rawLower.includes(syn.toLowerCase()))) return "implicit";

  // 3. This keyword is itself a known alias — check if the canonical form appears
  const canonicals = REVERSE_SYNONYMS[kwLower] ?? [];
  if (canonicals.some((can) => rawLower.includes(can.toLowerCase()))) return "implicit";

  // 4. Token-level matching for multi-word keywords
  const kwTokens = tokenize(kwLower).filter((t) => t.length > 2);
  if (kwTokens.length > 1) {
    const threshold = Math.ceil(kwTokens.length * 0.7);
    const matched = kwTokens.filter((kwTok) => {
      const stemKw = stem(kwTok);
      return textTokens.some(
        (t) =>
          t === kwTok ||
          stem(t) === stemKw ||
          t.includes(kwTok) ||
          kwTok.includes(t)
      );
    }).length;
    if (matched >= threshold) return matched === kwTokens.length ? "found" : "implicit";
  }

  // 5. Single-word stem match
  if (kwTokens.length === 1) {
    const stemKw = stem(kwTokens[0]);
    if (stemKw.length > 2 && textTokens.some((t) => stem(t) === stemKw)) return "implicit";
    // Also check if any text token contains the keyword as a prefix/suffix
    if (textTokens.some((t) => t.startsWith(kwTokens[0]) || kwTokens[0].startsWith(t))) return "implicit";
  }

  return "missing";
}

// ── Main exports ─────────────────────────────────────────────────────────────

/** Build a single flat string from ALL resume sections for maximal keyword coverage */
export function buildFullResumeText(
  resumeData: {
    summary?: string;
    experiences?: Array<{ title?: string; company?: string; bullets?: string[] }>;
    skills?: Array<{ name?: string; category?: string }>;
    projects?: Array<{ name?: string; description?: string; techStack?: string[] | string }>;
    certifications?: Array<{ name?: string; issuer?: string }>;
    educations?: Array<{ school?: string; degree?: string; field?: string }>;
  },
  coverLetter?: string
): string {
  const parts: string[] = [];

  if (resumeData.summary) parts.push(resumeData.summary);

  for (const exp of resumeData.experiences ?? []) {
    if (exp.title) parts.push(exp.title);
    if (exp.company) parts.push(exp.company);
    if (exp.bullets) parts.push(...exp.bullets);
  }

  for (const skill of resumeData.skills ?? []) {
    if (skill.name) parts.push(skill.name);
  }

  for (const proj of resumeData.projects ?? []) {
    if (proj.name) parts.push(proj.name);
    if (proj.description) parts.push(proj.description);
    const ts = proj.techStack;
    if (Array.isArray(ts)) parts.push(...ts);
    else if (typeof ts === "string" && ts) parts.push(ts);
  }

  for (const cert of resumeData.certifications ?? []) {
    if (cert.name) parts.push(cert.name);
    if (cert.issuer) parts.push(cert.issuer);
  }

  for (const edu of resumeData.educations ?? []) {
    if (edu.school) parts.push(edu.school);
    if (edu.degree) parts.push(edu.degree);
    if (edu.field) parts.push(edu.field);
  }

  if (coverLetter) parts.push(coverLetter);

  return parts.join(" ");
}

export interface CoverageResult {
  matches: KeywordMatch[];
  coverageScore: number;   // 0-100 weighted score (required+technical)
  requiredScore: number;   // % of required keywords covered
  technicalScore: number;  // % of technical keywords covered
}

export function analyzeKeywordCoverage(
  resumeData: Parameters<typeof buildFullResumeText>[0],
  keywords: KeywordMap,
  coverLetter?: string
): CoverageResult {
  const fullText = buildFullResumeText(resumeData, coverLetter);
  const textTokens = tokenize(fullText);

  const matches: KeywordMatch[] = [];

  const groups: Array<[string[], KeywordMatch["type"]]> = [
    [keywords.required ?? [], "required"],
    [keywords.preferred ?? [], "preferred"],
    [keywords.technical ?? [], "technical"],
    [keywords.soft ?? [], "soft"],
  ];

  for (const [kwList, type] of groups) {
    for (const kw of kwList) {
      if (!kw?.trim()) continue;
      const status = checkCoverage(kw, textTokens, fullText);
      matches.push({ keyword: kw, type, status });
    }
  }

  const required = matches.filter((m) => m.type === "required");
  const technical = matches.filter((m) => m.type === "technical");
  const important = [...required, ...technical];

  const covered = (arr: KeywordMatch[]) => arr.filter((m) => m.status !== "missing").length;

  const requiredScore = required.length > 0 ? Math.round((covered(required) / required.length) * 100) : 100;
  const technicalScore = technical.length > 0 ? Math.round((covered(technical) / technical.length) * 100) : 100;
  const coverageScore = important.length > 0 ? Math.round((covered(important) / important.length) * 100) : 100;

  return { matches, coverageScore, requiredScore, technicalScore };
}

export function highlightKeywords(text: string, keywords: KeywordMap): string {
  const allKeywords = [...(keywords.required ?? []), ...(keywords.preferred ?? []), ...(keywords.technical ?? []), ...(keywords.soft ?? [])];
  let result = text;
  for (const kw of allKeywords) {
    if (!kw?.trim()) continue;
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b(${escaped})\\b`, "gi");
    result = result.replace(regex, `<mark>$1</mark>`);
  }
  return result;
}

/** Filter skills to only those relevant to the keyword map.
 *  Always keeps at least minKeep skills so the section isn't empty. */
export function filterSkillsByRelevance(
  skills: Array<{ name: string; category: string }>,
  keywords: KeywordMap,
  minKeep = 6,
  maxKeep = 20
): Array<{ name: string; category: string }> {
  if (!skills?.length) return [];

  const scored = skills.map((s) => {
    const text = s.name.toLowerCase();
    const tokens = tokenize(text);
    let score = 0;
    for (const kw of keywords.required ?? []) {
      const st = checkCoverage(kw, tokens, text);
      if (st === "found") score += 4;
      else if (st === "implicit") score += 2;
    }
    for (const kw of keywords.technical ?? []) {
      const st = checkCoverage(kw, tokens, text);
      if (st === "found") score += 3;
      else if (st === "implicit") score += 1.5;
    }
    for (const kw of keywords.preferred ?? []) {
      const st = checkCoverage(kw, tokens, text);
      if (st === "found") score += 1;
      else if (st === "implicit") score += 0.5;
    }
    return { s, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Take all relevant (score > 0), pad with top-scored to reach minKeep
  const relevant = scored.filter((x) => x.score > 0);
  const base = relevant.length >= minKeep ? relevant : scored.slice(0, minKeep);
  return base.slice(0, maxKeep).map((x) => x.s);
}

/** Score a single project's relevance against a keyword map (higher = more relevant) */
export function scoreProjectRelevance(
  project: { name: string; description: string; techStack: string[] | string },
  keywords: KeywordMap
): number {
  const tech = Array.isArray(project.techStack)
    ? project.techStack.join(" ")
    : (project.techStack || "");
  const text = `${project.name} ${project.description} ${tech}`.toLowerCase();
  const tokens = tokenize(text);

  let score = 0;
  for (const kw of keywords.required ?? []) {
    const s = checkCoverage(kw, tokens, text);
    if (s === "found") score += 4;
    else if (s === "implicit") score += 2;
  }
  for (const kw of keywords.technical ?? []) {
    const s = checkCoverage(kw, tokens, text);
    if (s === "found") score += 3;
    else if (s === "implicit") score += 1.5;
  }
  for (const kw of keywords.preferred ?? []) {
    const s = checkCoverage(kw, tokens, text);
    if (s === "found") score += 1;
    else if (s === "implicit") score += 0.5;
  }
  return score;
}

/** Rank projects by relevance and keep the top N. Always returns at most maxCount items. */
export function filterProjectsByRelevance<
  T extends { name: string; description: string; techStack: string[] | string }
>(projects: T[], keywords: KeywordMap, maxCount = 4): T[] {
  if (!projects?.length) return [];
  const scored = projects.map((p) => ({ p, score: scoreProjectRelevance(p, keywords) }));
  scored.sort((a, b) => b.score - a.score);
  // Include any project with score > 0 first; if nothing qualifies keep top ranked anyway
  const relevant = scored.filter((s) => s.score > 0);
  return (relevant.length > 0 ? relevant : scored).slice(0, maxCount).map((s) => s.p);
}

/** Legacy helper — kept for compatibility */
export function findMissingKeywords(text: string, keywords: KeywordMap) {
  const lower = text.toLowerCase();
  const all = [...(keywords.required ?? []), ...(keywords.technical ?? [])];
  const found: string[] = [];
  const missing: string[] = [];
  for (const kw of all) {
    (lower.includes(kw.toLowerCase()) ? found : missing).push(kw);
  }
  return { found, missing };
}
