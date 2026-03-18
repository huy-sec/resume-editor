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

export function buildCoverLetterPrompt(resumeJSON: string, jobDescription: string, profileName: string): string {
  return `You are an expert cover letter writer. Write a personalized, compelling cover letter.

${HUMANIZATION_RULES}

CANDIDATE INFO:
Name: ${profileName}
Tailored Resume: ${resumeJSON}

JOB DESCRIPTION:
${jobDescription}

TASK:
Write a professional cover letter with:
- Opening paragraph: Express genuine interest in this specific role and company. Be specific about what excites you about this position. No generic openers.
- Middle paragraph: Highlight 2-3 specific achievements or experiences most relevant to this role, with concrete results
- Closing paragraph: Reinforce fit, express enthusiasm, call to action

STYLE:
- Natural, conversational-professional tone
- Specific to this company and role
- 3 paragraphs, no headers
- 250-350 words total
- Sound like a real person, not a template

OUTPUT: Return ONLY the cover letter text, no JSON, no headers, no "Dear Hiring Manager" prefix (I'll add that). Start directly with the opening paragraph.`;
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
