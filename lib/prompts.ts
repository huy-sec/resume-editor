export const HUMANIZATION_RULES = `
HUMANIZATION RULES — STRICTLY FOLLOW ALL OF THESE:

BANNED WORDS (never use any of these):
leverage, utilize, spearhead, delve, facilitate, foster, robust, streamline, synergy, pivotal,
cutting-edge, transformative, holistic, paradigm, impactful, innovative, solution-oriented,
result-driven, dynamic, proactive, seamless, seamlessly, comprehensive, meticulous, invaluable,
commendable, vibrant, elevate, testament, embark, passionate, passion, adept, proficiency,
showcasing, harnessing, groundbreaking, revolutionary, game-changing, disruptive, world-class,
best-in-class, thought leader, ecosystem, landscape, realm, sphere, journey, narrative, tapestry,
supercharge, unlock, unleash, empower, enable, ensure, demonstrate, amplify, accelerate, optimize,
leverage, orchestrate, spearhead, cultivate, nurture

BANNED PHRASES (never use):
- "not only X but also Y"
- "in order to" (use "to" instead)
- "as well as" (use "and" instead)
- "with the goal of"
- "in terms of"
- "with a focus on"
- "at the intersection of"
- "in the realm of"
- "it's worth noting"
- "it is important to"
- "I am passionate about"
- "I would be a great fit"
- "I am excited to contribute"
- "I look forward to hearing from you"
- "thank you for your time and consideration"
- "please do not hesitate to contact me"
- "I am writing to express my interest"
- "I am writing to apply"
- any phrase with "passion" or "passionate"

STRUCTURAL RULES:
- Never start a bullet with a present participle (-ing word): not "Building X", "Creating Y", "Developing Z" — use past tense: "Built X", "Created Y", "Developed Z"
- Never use the same sentence opener twice in a row (not two "I" sentences, not two "The" sentences)
- Mix short sentences (under 10 words) with longer ones — never 3+ sentences of similar length in a row
- Never list exactly 3 things in parallel structure repeatedly (X, Y, and Z pattern is an AI tell)
- No em dashes (—). Use commas or periods instead
- Avoid passive voice — use active voice throughout
- Do not start two consecutive bullets with the same verb
- Write in past tense for bullets (did, built, led, reduced) — not present tense
- Use first-person implied in bullets (no "I" at the start)
- No buzzword pairs: "fast-paced environment", "collaborative culture", "results-oriented team"
- Vary punctuation: not every sentence ends with a period — some can end mid-thought with a comma continuing into the next clause

TONE:
- Write like a real professional emailing a colleague, not a corporate brochure
- Use concrete numbers, names, and specific details — vague claims are AI tells
- Occasional mild imperfection is more human than polished-to-perfection prose
- If writing cover letter prose, contractions are fine (I've, I'd, it's, we're)
`;

export function buildTailorPrompt(profileJSON: string, jobDescription: string): string {
  return `You are an expert resume writer and ATS optimization specialist. Your job is to tailor a resume for a specific job posting.

${HUMANIZATION_RULES}

PROFILE DATA:
${profileJSON}

JOB DESCRIPTION:
${jobDescription}

TASK:
1. Analyze the job description to identify ALL keywords: required skills, preferred skills, soft skills, tools, methodologies, and key responsibilities

2. KEYWORD COVERAGE STRATEGY — this is the most important step:
   - Extract every meaningful keyword from the JD (technical AND soft)
   - For EACH keyword, determine if it can honestly appear in the resume based on:
     a) What the candidate explicitly listed in their profile, OR
     b) What their job title IMPLIES they would have done (e.g., a "Team Lead" implies collaboration, mentoring, communication, planning; a "Software Engineer" implies problem-solving, code review, debugging, technical documentation)
     c) What their projects demonstrate (e.g., a deployed web app implies ownership, full-stack thinking, user focus)
   - The EXACT keyword (or a direct grammatical form of it, e.g. "collaborate" → "collaborated") MUST appear literally in the resume text — in bullets, summary, or skills
   - Do NOT paraphrase keywords — ATS systems scan for the exact word. Write bullets that contain the keyword naturally in context.
   - Soft skill keywords (e.g., "communication", "collaboration", "leadership", "analytical", "attention to detail", "problem-solving", "adaptability", "cross-functional"): embed the EXACT word into a bullet that describes a real action implied by their role. Example: if JD says "communication" and the person was a Team Lead, write "Maintained clear communication with stakeholders across design, product, and engineering teams during sprint planning."
   - Technical keywords: if the person's job title or projects strongly imply they worked with a technology (even if not explicitly listed), include it in skills and reference it in a bullet where appropriate. Be honest — don't fabricate specific experience, but do infer reasonable skills from context.

3. Rewrite experience bullets to:
   - Start with strong, varied action verbs — never repeat the same verb twice
   - Embed JD keywords naturally — the exact word must appear
   - Include specific metrics and quantified results where possible
   - One line per bullet, 12-16 words max
   - Each bullet should feel like something a real person in that job title actually did

4. Skills section:
   - Include skills from the JD that are covered by the candidate's explicit skills OR clearly implied by their job titles/projects
   - Be FLEXIBLE: a Frontend Developer who built React apps almost certainly knows about responsive design, component architecture, state management — include these if the JD asks for them
   - Soft skills: include in skills if the JD lists them AND the candidate's roles clearly involve them
   - Max 4 categories, 5-8 skills per category
   - Every skill listed MUST also appear somewhere in the resume body (bullet or summary)

5. Generate a tailored professional summary (2-3 sentences) that naturally uses 3-5 of the top JD keywords

STRICT 2-PAGE LENGTH RULES — YOU MUST FOLLOW THESE EXACTLY:
- Summary: 2-3 sentences, no exceptions
- Experience: pick the 3-5 MOST relevant roles only — drop the rest
- Bullets per role: 3-5 max. Prefer 4. Each bullet is ONE line, no wrapping
- Bullet relevance: every bullet MUST either contain a JD keyword OR directly demonstrate a skill the JD requires. Remove any bullet that does not serve those criteria.
- Projects: include ONLY 3-5 projects that are directly relevant to this job description
  - If a project does not clearly demonstrate a skill the JD asks for, EXCLUDE it
  - Project description: 1 sentence max (under 20 words)
  - TechStack: list only, no sentences
- Education: school, degree, and dates only — no extra detail
- Certifications: only include if the JD explicitly asks for them OR they are broadly relevant to the role
- Skills: relevant only, no padding
The final resume MUST fit on 2 pages or less. When in doubt, cut.

FIELD-SPECIFIC FILTERING RULES:
- If the job role is NOT in cybersecurity / information security / penetration testing: EXCLUDE all cybersecurity-specific certifications (e.g. Security+, CEH, CISSP, eJPT, OSCP, CISM, and similar). Also exclude cybersecurity-specific education entries (e.g. coursework in ethical hacking, network security, infosec). Also set "includeGithub": false in the output.
- If the job role IS in cybersecurity / information security: include all relevant security certifications and education. Set "includeGithub": true.

OUTPUT: Return ONLY valid JSON in this exact structure:
{
  "jobTitle": "detected job title from JD",
  "company": "detected company name from JD or empty string",
  "includeGithub": true,
  "summary": "2-3 sentence tailored summary",
  "experiences": [
    {
      "company": "string",
      "title": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "bullets": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"]
    }
  ],
  "educations": [
    {
      "school": "string",
      "degree": "string",
      "field": "string",
      "startDate": "string",
      "endDate": "string",
      "gpa": "string"
    }
  ],
  "skills": [
    { "name": "string", "category": "string" }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "techStack": ["string"],
      "link": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string"
    }
  ]
}`;
}

export function buildCoverLetterPrompt(resumeJSON: string, jobDescription: string, profileName: string, writingStyleExample?: string, personalityContext?: string): string {
  const styleSection = writingStyleExample ? `\nMATCH THIS WRITING STYLE AND VOICE (this is an example of how the candidate writes):\n${writingStyleExample}\n` : "";
  const personalitySection = personalityContext ? `\n${personalityContext}\n` : "";

  return `You are an expert cover letter writer. Write a cover letter that sounds like a real person — warm, confident, and specific.

${HUMANIZATION_RULES}

CANDIDATE INFO:
Name: ${profileName}
Tailored Resume: ${resumeJSON}
${styleSection}${personalitySection}
JOB DESCRIPTION:
${jobDescription}

TASK:
Write a cover letter that genuinely reflects this person's voice and enthusiasm.

Rules:
- Open with something SPECIFIC about this company or role — a detail from the JD, something about their product, a concrete problem they're solving. Never open with "I am writing", never open with enthusiasm clichés
- Middle: ONE specific achievement told with a number and a named outcome. Keep it tight — 2–3 sentences max for the story
- Closing: end with a direct, confident statement about what you'd bring. Do NOT write "I look forward to hearing from you", "thank you for your consideration", or "please don't hesitate to contact me" — end on something forward-moving and specific
- 3 paragraphs, 250–300 words total
- Contractions are expected — write like a real person (I've, I'd, it's, that's)
- Vary sentence length aggressively: short punchy sentences alongside longer detailed ones
- Do NOT use: any word from the banned list, any banned phrase, present-participle openers ("Working at X taught me", "Having spent Y years" is fine; "Building X, I learned" is not)
- Every sentence must be irreplaceable — if it could appear in any cover letter, cut it or make it specific
- No bullet points

OUTPUT: Return ONLY the cover letter body text (no greeting, no sign-off). Start with the first sentence of the opening paragraph.`;
}

export function buildScoringPrompt(text: string): string {
  return `You are an expert AI writing detector. Score the following text on how human it sounds. Be strict — most AI-assisted writing scores 40–65; genuinely human writing scores 75–95.

TEXT TO ANALYZE:
${text}

Check ALL of the following AI writing indicators:

VOCABULARY TELLS:
- Banned corporate/AI words: leverage, utilize, spearhead, delve, facilitate, foster, robust, streamline, synergy, pivotal, cutting-edge, transformative, holistic, paradigm, impactful, innovative, seamless, comprehensive, meticulous, invaluable, vibrant, elevate, testament, embark, passionate, adept, proficiency, showcasing, harnessing, groundbreaking, ecosystem, landscape, realm, empower, ensure, amplify, orchestrate, cultivate, nurture, supercharge, unlock, unleash

STRUCTURAL TELLS:
- Present participle bullet openers ("Building X", "Creating Y", "Developing Z" instead of "Built", "Created", "Developed")
- "Not only X but also Y" constructions
- Lists of exactly 3 parallel items repeated throughout
- Em dash (—) overuse
- Passive voice frequency
- All sentences similar length (AI tends toward uniform 15–20 word sentences)
- Repetitive sentence openers (multiple sentences starting with "I", "The", "This", "By")
- Filler phrases: "in order to", "as well as", "with the goal of", "in terms of", "it's worth noting"
- Present tense bullets instead of past tense

COVER LETTER SPECIFIC:
- Generic openers: "I am writing to express my interest", "I am writing to apply"
- Enthusiasm clichés: "passionate about", "excited to contribute", "would be a great fit"
- Generic closers: "I look forward to hearing from you", "thank you for your consideration", "please do not hesitate"
- Three-paragraph structure where each paragraph is exactly the same length
- No specific company or role details (generic enough to send anywhere)

CONTENT TELLS:
- Vague claims with no numbers, names, or specifics
- "Rule of three" (X, Y, and Z) used repeatedly
- Every bullet follows subject-verb-object with same rhythm
- Overly smooth transitions between ideas (no natural roughness)

SCORING GUIDE:
- 85–100: Sounds genuinely human, would pass most AI detectors
- 70–84: Mostly human, minor AI patterns present
- 50–69: Mixed — AI patterns are noticeable to trained readers
- 30–49: Clearly AI-assisted, multiple strong indicators
- 0–29: Unmistakably AI-generated

OUTPUT: Return ONLY valid JSON:
{
  "score": <0-100>,
  "flags": [
    { "type": "vocab|structure|cover-letter|content", "description": "specific instance found with exact quote", "severity": "low|medium|high" }
  ],
  "suggestions": ["specific actionable fix with example of before/after"]
}`;
}

export function buildImportPrompt(rawText: string): string {
  return `You are an expert resume parser. Extract structured profile data from the following raw text (could be a resume, LinkedIn export, or any professional background text).

RAW TEXT:
${rawText}

Extract all information you can find and return ONLY valid JSON in this structure:
{
  "name": "string or empty",
  "email": "string or empty",
  "phone": "string or empty",
  "location": "string or empty",
  "linkedIn": "string or empty",
  "github": "string or empty",
  "website": "string or empty",
  "summary": "string or empty",
  "experiences": [
    {
      "company": "string",
      "title": "string",
      "startDate": "string",
      "endDate": "string",
      "current": false,
      "bullets": ["bullet 1", ...],
      "sortOrder": 0
    }
  ],
  "educations": [
    {
      "school": "string",
      "degree": "string",
      "field": "string",
      "startDate": "string",
      "endDate": "string",
      "gpa": "string"
    }
  ],
  "skills": [
    { "name": "string", "category": "technical|soft|tools|languages|general" }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "techStack": ["string"],
      "link": "string",
      "sortOrder": 0
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string",
      "link": "string"
    }
  ]
}

Rules:
- If a field is not found, use empty string or empty array
- For skills, try to categorize them (technical = programming languages/frameworks, tools = software tools, soft = interpersonal skills)
- For dates, use "Month YYYY" format when possible
- Extract ALL experiences, projects, and skills you can find`;
}

export type TailorApproach =
  | "career-momentum"
  | "domain-expert"
  | "mission-alignment"
  | "career-pivot"
  | "high-impact-operator";

export const APPROACH_DESCRIPTIONS: Record<
  TailorApproach,
  { label: string; tagline: string; whyApply: string; description: string; instruction: string }
> = {
  "career-momentum": {
    label: "Career Momentum",
    tagline: "You're the natural next step",
    whyApply:
      "This role is where your career trajectory has been heading. Every position you've held has built toward this exact opportunity.",
    description:
      "Best when your title progression, scope of work, and skills line up naturally with the role. Shows the hiring manager you didn't apply on a whim.",
    instruction:
      "Frame bullets to show clear progression and increasing scope of responsibility. Connect each role to the next as a deliberate career arc. Lead with achievements that demonstrate readiness for this level. Use the JD's exact keywords naturally throughout. Quantify impact at every opportunity.",
  },
  "domain-expert": {
    label: "Domain Expert",
    tagline: "You know this space inside out",
    whyApply:
      "You've spent years in this specific domain. You understand the problems, the constraints, and the shortcuts that take others years to learn.",
    description:
      "Best when you have deep experience in the same industry, technology stack, or function the role requires. Deep credibility beats broad experience.",
    instruction:
      "Emphasize domain-specific knowledge, industry terminology, and problems unique to this space. Show you've already solved what they're hiring to solve. Match technical and industry keywords from the JD precisely. Lead bullets with measurable outcomes that only someone with deep domain experience would achieve.",
  },
  "mission-alignment": {
    label: "Mission Alignment",
    tagline: "You're here for what they're building",
    whyApply:
      "You're not just looking for any job — you're applying here because you believe in what this company is doing and want to be part of building it.",
    description:
      "Best for mission-driven companies, startups, or roles where cultural fit and genuine interest in the work matters as much as skills.",
    instruction:
      "Connect your past work to the company's mission and values. Show your interest is specific, not generic. Frame achievements in terms of user impact, product outcomes, and team culture. Cover letter should feel personal and authentic to this specific company. Still hit all ATS keywords and quantify results.",
  },
  "career-pivot": {
    label: "Career Pivot",
    tagline: "Your different background is the advantage",
    whyApply:
      "You're bringing a perspective traditional candidates can't offer. Your path through different roles or industries gives you insight and adaptability that's genuinely rare.",
    description:
      "Best when switching industries, functions, or disciplines. Reframes transferable experience as a strategic advantage rather than a gap.",
    instruction:
      "Lead with transferable skills and reframe past experience through the lens of this new role. Draw explicit connections between what you've done and what they need. Emphasize adaptability, fast learning, and cross-domain insight. Still weave in JD keywords and quantify all achievements to show concrete impact.",
  },
  "high-impact-operator": {
    label: "High-Impact Operator",
    tagline: "You come in and get things done",
    whyApply:
      "You've solved problems like theirs before, at real scale. You're not here to learn the ropes — you're here to own outcomes from day one.",
    description:
      "Best for senior roles, high-growth companies, or positions where execution speed and proven delivery matter more than credentials.",
    instruction:
      "Lead every bullet with specific, large-scale results. Numbers, percentages, dollar amounts, team sizes, and timelines must appear in nearly every bullet. Show scope and velocity. The summary should communicate 'I've done this before and I'll do it again here.' Hit all ATS keywords without it feeling like keyword stuffing.",
  },
};

export function buildApproachRecommendationPrompt(profileJSON: string, jobDescription: string): string {
  return `You are a senior career strategist. Analyze this candidate's profile against the job description and recommend the best application approach.

CANDIDATE PROFILE:
${profileJSON}

JOB DESCRIPTION:
${jobDescription}

AVAILABLE APPROACHES:
- career-momentum: Best when career trajectory naturally leads to this role
- domain-expert: Best when candidate has deep specific experience in the same domain
- mission-alignment: Best when company culture/mission fit is a key differentiator
- career-pivot: Best when candidate is switching fields but has strong transferable skills
- high-impact-operator: Best when proven large-scale results are the main selling point

Analyze the fit between the profile and JD, then return ONLY valid JSON:
{
  "recommended": "the single best approach key",
  "reasoning": "2-3 sentences explaining exactly why this approach fits this specific candidate and this specific job",
  "alternatives": [
    { "approach": "second best approach key", "reason": "one sentence why this could also work" },
    { "approach": "third best approach key", "reason": "one sentence why this could also work" }
  ],
  "fitSummary": "1-2 sentences on the overall match strength and any gaps to address"
}`;
}

export function buildTailorPromptWithApproach(profileJSON: string, jobDescription: string, approach: TailorApproach, writingStyleExample?: string, personalityContext?: string, userNotes?: string): string {
  const approachConfig = APPROACH_DESCRIPTIONS[approach];
  const styleSection = writingStyleExample ? `\nUSER'S WRITING STYLE EXAMPLE (match this tone and voice closely):\n${writingStyleExample}\n` : "";
  const personalitySection = personalityContext ? `\n${personalityContext}\n` : "";
  const notesSection = userNotes ? `\nUSER INSTRUCTIONS — FOLLOW THESE EXACTLY (these override defaults where they conflict):\n${userNotes}\n` : "";

  return `You are an expert resume writer and ATS optimization specialist. Your job is to tailor a resume for a specific job posting.

${HUMANIZATION_RULES}

APPLICATION APPROACH: ${approachConfig.label}
WHY THE CANDIDATE IS APPLYING (weave this narrative into the summary and tone):
"${approachConfig.whyApply}"

APPROACH EXECUTION INSTRUCTIONS:
${approachConfig.instruction}
${styleSection}${personalitySection}${notesSection}
PROFILE DATA:
${profileJSON}

JOB DESCRIPTION:
${jobDescription}

TASK:
1. Extract ALL keywords from the JD: required skills, preferred skills, soft skills, methodologies, tools, and key responsibilities

2. KEYWORD COVERAGE STRATEGY — most important step:
   - For EACH keyword, determine if it can honestly be placed in the resume based on:
     a) What the candidate explicitly listed in their profile, OR
     b) What their job title IMPLIES they would have done (e.g., "Team Lead" implies collaboration, mentoring, communication, sprint planning, stakeholder updates; "Software Engineer" implies debugging, code review, technical documentation, problem-solving, testing)
     c) What their projects demonstrate (e.g., a shipped product implies ownership, user empathy, iteration)
   - The EXACT keyword (or direct grammatical form) MUST appear literally in the resume text — in bullets, summary, or skills
   - Soft skill keywords (communication, collaboration, leadership, analytical, adaptability, cross-functional, etc.): embed the exact word into a bullet describing a real action that role would do. Example: if JD lists "communication" and the person is a Developer, write "Maintained clear communication with product and design teams to clarify requirements before each sprint."
   - Technical keywords: if the role or projects imply familiarity, include in skills and reference in a bullet
   - Be flexible but honest — infer reasonable skills from job title context, do not fabricate specific certifications or technologies never touched

3. Apply the "${approachConfig.label}" approach consistently — the summary especially should reflect the "why" narrative above

4. Rewrite bullets following the approach:
   - Embed JD keywords naturally — exact word must appear
   - Start with strong, varied action verbs — never repeat the same verb
   - Every bullet must include at least one: number, percentage, timeframe, team size, or named technology
   - One line per bullet, 12-16 words max
   - Sound like a real person who held that job title, not a template

5. Skills section:
   - Include skills from the JD covered by explicit profile data OR clearly implied by job titles/projects
   - Every skill listed MUST also appear in the body (bullet or summary)
   - Max 4 categories, 5-8 skills per category
   - Soft skills: include if JD asks for them and the candidate's roles clearly involve them

6. Generate a tailored professional summary (2-3 sentences) using 3-5 top JD keywords naturally, reflecting the approach narrative

7. Select 3-5 most relevant projects only — exclude anything not directly relevant to this JD

8. Bullet relevance: every bullet MUST either contain a JD keyword OR directly demonstrate a skill the JD requires. Cut any bullet that does not qualify.

9. FIELD-SPECIFIC FILTERING RULES:
   - If the job role is NOT in cybersecurity / information security / penetration testing: EXCLUDE all cybersecurity-specific certifications (e.g. Security+, CEH, CISSP, eJPT, OSCP, CISM, and similar). Also exclude cybersecurity-specific education entries. Set "includeGithub": false.
   - If the job role IS in cybersecurity / information security: include all relevant security certifications and education. Set "includeGithub": true.

Make the resume sound like a real person wrote it — with personality, specific details, and natural language. Avoid corporate speak.

OUTPUT: Return ONLY valid JSON in this exact structure:
{
  "jobTitle": "detected job title from JD",
  "company": "detected company name from JD or empty string",
  "includeGithub": true,
  "summary": "2-3 sentence tailored summary",
  "approach": "${approach}",
  "experiences": [
    {
      "company": "string",
      "title": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "bullets": ["bullet 1", "bullet 2", ...]
    }
  ],
  "educations": [
    {
      "school": "string",
      "degree": "string",
      "field": "string",
      "startDate": "string",
      "endDate": "string",
      "gpa": "string"
    }
  ],
  "skills": [
    { "name": "string", "category": "string" }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "techStack": ["string"],
      "link": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string"
    }
  ]
}`;
}

export function buildHumanizeRewritePrompt(resumeJSON: string, coverLetterText: string, flags: { type: string; description: string; severity?: string }[], suggestions: string[], writingStyleExample?: string): string {
  const styleSection = writingStyleExample ? `\nUSER'S WRITING STYLE (match this voice exactly — this is how they naturally write):\n${writingStyleExample}\n` : "";

  return `You are an expert editor who makes AI-written text undetectable. You must rewrite this resume and cover letter so they pass strict AI detectors and sound like a real person wrote them.

${HUMANIZATION_RULES}

ADDITIONAL REWRITING RULES:
- Every bullet must start with a strong PAST TENSE verb (Built, Reduced, Led, Shipped, Designed, Wrote, Cut, Grew, Ran, Managed, Launched, Fixed, Automated, Negotiated, Trained)
- Never start a bullet with an -ing word
- Break any "not only X but also Y" into two separate sentences
- If a sentence has "passionate", "seamless", "comprehensive", or any banned word — rewrite the entire sentence from scratch
- Cover letter: each paragraph should have at least one sentence under 10 words AND one over 20 words
- Cover letter: the opening sentence must reference something specific about this role or company — not a generic enthusiasm statement
- Cover letter: closing paragraph must NOT contain "look forward to hearing from you", "thank you for your consideration", or "do not hesitate" — end with a direct, confident statement instead
- Add at least 2 specific details (numbers, tool names, team sizes, timeframes) that weren't already in the text
- If two consecutive sentences start with the same word, rewrite one of them
- Vary the rhythm: after a long complex sentence, follow with a short punchy one
${styleSection}
FLAGS TO FIX:
${flags.map((f) => `- [${(f.severity ?? "medium").toUpperCase()}] ${f.type}: ${f.description}`).join("\n") || "No specific flags — do a full pass for all AI patterns"}

SUGGESTIONS TO APPLY:
${suggestions.map((s) => `- ${s}`).join("\n") || "Apply all humanization rules throughout"}

RESUME TO REWRITE:
${resumeJSON}

COVER LETTER TO REWRITE:
${coverLetterText}

OUTPUT: Return ONLY valid JSON (no markdown, no code fences):
{
  "resumeJSON": { ...same structure as input, all fields preserved },
  "coverLetterText": "full rewritten cover letter body"
}`;
}

export function buildPersonalityContext(profile: {
  mbti?: string;
  workStyle?: string;
  personalityAnswers?: string;
  careerMotivators?: string;
  communicationStyle?: string;
  personalBrand?: string;
}): string {
  const answers = (() => {
    try { return JSON.parse(profile.personalityAnswers || "{}"); } catch { return {}; }
  })();
  const motivators = (() => {
    try { return JSON.parse(profile.careerMotivators || "[]"); } catch { return []; }
  })();

  const parts: string[] = [];

  if (profile.mbti) {
    const mbtiContext: Record<string, string> = {
      INTJ: "analytical, strategic, direct, values competence and results, prefers precision over warmth",
      INTP: "logical, curious, precise, values accuracy, understated confidence",
      ENTJ: "decisive, commanding, results-driven, confident, direct communicator",
      ENTP: "creative problem-solver, enthusiastic, challenges assumptions, big-picture thinker",
      INFJ: "thoughtful, values-driven, mission-focused, empathetic but private",
      INFP: "authentic, values-aligned, passionate about meaning, gentle but deeply committed",
      ENFJ: "people-oriented, inspiring, communicates impact through relationships and growth",
      ENFP: "enthusiastic, creative, connects ideas across domains, warm and genuine",
      ISTJ: "reliable, detail-oriented, process-driven, consistent, dependable",
      ISFJ: "supportive, conscientious, thorough, quietly dedicated",
      ESTJ: "organized, direct, results-focused, leads through structure and accountability",
      ESFJ: "collaborative, team-oriented, warm, values harmony and recognition",
      ISTP: "practical, hands-on, efficient, fixes things, low ego",
      ISFP: "creative, flexible, genuine, works through care and craftsmanship",
      ESTP: "action-oriented, practical, adaptable, thrives in fast-moving environments",
      ESFP: "energetic, spontaneous, people-focused, learns by doing",
    };
    const mbtiDesc = mbtiContext[profile.mbti.toUpperCase()] || "";
    parts.push(`MBTI Type: ${profile.mbti.toUpperCase()}${mbtiDesc ? ` — ${mbtiDesc}` : ""}`);
  }

  if (profile.workStyle) parts.push(`Work Style: ${profile.workStyle}`);
  if (profile.communicationStyle) parts.push(`Communication Style: ${profile.communicationStyle}`);
  if (profile.personalBrand) parts.push(`How they want to be perceived: ${profile.personalBrand}`);
  if (motivators.length > 0) parts.push(`Career Motivators: ${motivators.join(", ")}`);

  if (Object.keys(answers).length > 0) {
    parts.push("Personality Q&A:");
    for (const [q, a] of Object.entries(answers)) {
      if (a) parts.push(`  Q: ${q}\n  A: ${a}`);
    }
  }

  if (parts.length === 0) return "";
  return `\nCANDIDATE PERSONALITY PROFILE (use this to match tone, voice, and emphasis):\n${parts.join("\n")}\n`;
}

export function buildKeywordPrompt(jobDescription: string): string {
  return `Extract every meaningful keyword from this job description for ATS optimization and keyword coverage scoring.

JOB DESCRIPTION:
${jobDescription}

Rules:
- Extract the EXACT words/phrases as they appear in the JD — ATS systems match on exact words
- For soft skills, extract the exact noun form (e.g., "communication", "collaboration", "leadership", "adaptability", "attention to detail") — not the sentence they appear in
- For technical keywords, include the exact tool/language/framework name as written
- Include all keywords even if they seem obvious — every one counts for ATS scoring
- "required" = explicitly stated as required / must-have
- "preferred" = stated as preferred, nice-to-have, bonus, or plus
- "technical" = specific named technologies, tools, languages, platforms, frameworks, methodologies (Agile, Scrum, etc.)
- "soft" = interpersonal, behavioral, or cognitive skills (communication, teamwork, problem-solving, etc.)

Return ONLY valid JSON:
{
  "required": ["exact keyword as written in JD"],
  "preferred": ["exact keyword as written in JD"],
  "technical": ["exact technology/tool name"],
  "soft": ["exact soft skill word or phrase"],
  "jobTitle": "the exact job title from the posting",
  "company": "company name if mentioned, empty string if not"
}`;
}
