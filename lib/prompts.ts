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
1. Analyze the job description to identify: required skills, preferred skills, key responsibilities, company culture signals
2. Select and reorder the most relevant experience entries, projects, and skills from the profile
3. Rewrite experience bullets to:
   - Naturally incorporate keywords from the job description
   - Start with strong action verbs (varied, not repeated)
   - Include specific metrics and quantified results where possible
   - Be 1-2 lines max per bullet
4. Select the most relevant skills matching the JD
5. Generate a tailored professional summary (2-3 sentences)

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

export function buildCoverLetterPrompt(resumeJSON: string, jobDescription: string, profileName: string, writingStyleExample?: string): string {
  const styleSection = writingStyleExample ? `\nMATCH THIS WRITING STYLE AND VOICE (this is an example of how the candidate writes):\n${writingStyleExample}\n` : "";

  return `You are an expert cover letter writer. Write a cover letter that sounds like a real person — warm, confident, and specific.

${HUMANIZATION_RULES}

CANDIDATE INFO:
Name: ${profileName}
Tailored Resume: ${resumeJSON}
${styleSection}
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

export function buildTailorPromptWithApproach(profileJSON: string, jobDescription: string, approach: TailorApproach, writingStyleExample?: string): string {
  const approachConfig = APPROACH_DESCRIPTIONS[approach];
  const styleSection = writingStyleExample ? `\nUSER'S WRITING STYLE EXAMPLE (match this tone and voice closely):\n${writingStyleExample}\n` : "";

  return `You are an expert resume writer and ATS optimization specialist. Your job is to tailor a resume for a specific job posting.

${HUMANIZATION_RULES}

APPLICATION APPROACH: ${approachConfig.label}
WHY THE CANDIDATE IS APPLYING (weave this narrative into the summary and tone):
"${approachConfig.whyApply}"

APPROACH EXECUTION INSTRUCTIONS:
${approachConfig.instruction}
${styleSection}
PROFILE DATA:
${profileJSON}

JOB DESCRIPTION:
${jobDescription}

TASK:
1. Analyze the job description to identify: required skills, preferred skills, key responsibilities, company culture signals
2. Apply the "${approachConfig.label}" approach consistently — the summary especially should reflect the "why" narrative above
3. Select and reorder the most relevant experience entries, projects, and skills from the profile
4. Rewrite experience bullets following the approach — specific, concrete, human, with metrics wherever possible
5. Generate a tailored professional summary (2-3 sentences) that reflects both the approach narrative AND the candidate's actual background

CRITICAL: Every bullet must include at least one of: a number, a percentage, a timeframe, a team size, or a named technology. Generic bullets with no specifics are not acceptable.

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

export function buildKeywordPrompt(jobDescription: string): string {
  return `Extract keywords and requirements from this job description for ATS optimization.

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON:
{
  "required": ["skill or requirement that is clearly required"],
  "preferred": ["skill or requirement that is preferred/nice-to-have"],
  "technical": ["specific technologies, tools, languages, frameworks"],
  "soft": ["soft skills mentioned"],
  "jobTitle": "the exact job title",
  "company": "company name if mentioned"
}`;
}
