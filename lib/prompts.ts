export const HUMANIZATION_RULES = `
HUMANIZATION RULES - STRICTLY FOLLOW THESE:
- Never use em dashes (—). Use commas or periods instead.
- Never use these words: leverage, utilize, spearhead, delve, facilitate, foster, robust, streamline, synergy, pivotal, cutting-edge, transformative, holistic, paradigm, impactful, innovative, solution-oriented, result-driven, dynamic, proactive
- Vary sentence length: mix short punchy sentences with longer detailed ones
- Use concrete numbers and specific details whenever possible
- Write in active voice, not passive voice
- Do not start two consecutive bullet points with the same verb
- Write naturally like a real professional, not a corporate brochure
- Use first-person implied (no "I" at the start of bullets)
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
- Projects: include ONLY 3-5 projects that are directly relevant to this job description
  - If a project does not clearly demonstrate a skill the JD asks for, EXCLUDE it
  - Project description: 1 sentence max (under 20 words)
  - TechStack: list only, no sentences
- Education: school, degree, and dates only — no extra detail
- Certifications: only include if the JD explicitly asks for them
- Skills: relevant only, no padding
The final resume MUST fit on 2 pages or less. When in doubt, cut.

OUTPUT: Return ONLY valid JSON in this exact structure:
{
  "jobTitle": "detected job title from JD",
  "company": "detected company name from JD or empty string",
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
- Open with something specific about the company or role that excites you — no generic openers
- Middle: pick ONE or TWO specific stories or achievements, told briefly but vividly
- Closing: direct and confident, not sycophantic
- 3 paragraphs, 250-320 words
- Sound like a person, not a template — occasional contractions are fine
- Do NOT use: "I am writing to express my interest", "I would be a great fit", "passionate about", "excited to contribute"
- No bullet points in the cover letter

OUTPUT: Return ONLY the cover letter body text (no greeting, no sign-off). Start with the first sentence of the opening paragraph.`;
}

export function buildScoringPrompt(text: string): string {
  return `You are an AI writing detector expert. Analyze the following text and score how human-sounding it is.

TEXT TO ANALYZE:
${text}

Check for these AI writing indicators:
1. AI vocabulary: leverage, utilize, spearhead, delve, facilitate, foster, robust, streamline, synergy, pivotal, cutting-edge, transformative, holistic, paradigm, impactful
2. Em dashes (—) overuse
3. Passive voice frequency
4. Sentence length uniformity (all similar length = AI tell)
5. Repetitive sentence openers
6. Overly formal or corporate buzzword density
7. Lack of specific details / numbers
8. The "rule of three" (lists of exactly 3 things repeatedly)
9. Filler phrases: "in order to", "as well as", "in terms of", "with the goal of"
10. Unnatural transitions

OUTPUT: Return ONLY valid JSON:
{
  "score": <0-100, where 100 = very human, 0 = very AI-sounding>,
  "flags": [
    { "type": "vocab|style|structure|passive", "description": "specific issue found", "severity": "low|medium|high" }
  ],
  "suggestions": ["specific actionable suggestion 1", "suggestion 2"]
}

Be honest and specific. A score of 85+ means it would likely pass AI detectors.`;
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

Make the resume sound like a real person wrote it — with personality, specific details, and natural language. Avoid corporate speak.

OUTPUT: Return ONLY valid JSON in this exact structure:
{
  "jobTitle": "detected job title from JD",
  "company": "detected company name from JD or empty string",
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
  const styleSection = writingStyleExample ? `\nUSER'S WRITING STYLE EXAMPLE (match this voice exactly):\n${writingStyleExample}\n` : "";

  return `You are an expert editor specializing in making writing sound genuinely human. You have received a resume and cover letter that an AI detector has flagged.

${HUMANIZATION_RULES}

AI DETECTOR FLAGS FOUND:
${flags.map((f) => `- [${(f.severity ?? "medium").toUpperCase()}] ${f.type}: ${f.description}`).join("\n")}

SUGGESTIONS:
${suggestions.map((s) => `- ${s}`).join("\n")}
${styleSection}
RESUME TO REWRITE:
${resumeJSON}

COVER LETTER TO REWRITE:
${coverLetterText}

TASK:
Fix every flagged issue. Rewrite all problematic sections to sound natural, personal, and human.
- Vary sentence structure and length
- Replace all AI vocabulary with natural alternatives
- Remove em dashes, replace with commas or periods
- Make bullets sound like a real person describing their work
- Add personality — these should feel authentic, not templated
- Keep all the facts, achievements, and numbers intact
- Cover letter should read like a real person wrote it at their desk, not a template

OUTPUT: Return ONLY valid JSON:
{
  "resumeJSON": { ...same structure as input resume },
  "coverLetterText": "full rewritten cover letter text"
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
