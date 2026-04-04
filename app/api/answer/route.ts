import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callClaude } from "@/lib/claude";
import { HUMANIZATION_RULES } from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { resumeId, question } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: "Question is required" }, { status: 400 });

  const resume = await prisma.tailoredResume.findFirst({
    where: { id: resumeId, userId: session.user.id },
  });
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { experiences: true, skills: true, certifications: true, projects: true, educations: true },
  });

  const resumeData = JSON.parse(resume.resumeJSON || "{}");

  const voiceContext = [
    profile?.writingStyleExample ? `Writing style example from the candidate: "${profile.writingStyleExample}"` : "",
    profile?.communicationStyle ? `Communication style: ${profile.communicationStyle}` : "",
    profile?.personalBrand ? `Personal brand: ${profile.personalBrand}` : "",
    profile?.mbti ? `Personality type: ${profile.mbti}` : "",
    profile?.workStyle ? `Work style: ${profile.workStyle}` : "",
  ].filter(Boolean).join("\n");

  const prompt = `You are helping a job applicant answer an employer's application question. Your answer must sound like the applicant wrote it themselves — personal, direct, and natural.

${HUMANIZATION_RULES}

ADDITIONAL RULES FOR SHORT-FORM ANSWERS:
- 2–4 sentences max, never more than 80 words — be tight and direct
- Do NOT open with "I" as the very first word — restructure to start with a specific detail, context, or action
- No throat-clearing openers: never start with "Great question", "That's a good point", "I've always believed", "Throughout my career", "As someone who"
- No generic closers: never end with "I look forward to discussing", "I'm excited about this opportunity", "I believe I would be a great fit"
- Refer to one specific, concrete thing from the resume (a project name, a number, a tool, a team) — not vague generalities
- Use contractions naturally (I've, I'd, it's, that's) — they make answers sound human
- One rough edge is better than total polish — don't wrap everything up too neatly
- Write as if typing a response to a colleague, not submitting a formal statement

CANDIDATE VOICE & PERSONALITY:
${voiceContext || "No personality data provided — write in a warm, direct, professional tone."}

TAILORED RESUME CONTEXT (for this specific role):
Role: ${resume.jobTitle} at ${resume.company}
Summary: ${resumeData.summary || ""}
Key experiences: ${(resumeData.experiences || []).slice(0, 3).map((e: { title: string; company: string; bullets: string[] }) => `${e.title} at ${e.company}: ${(e.bullets || []).slice(0, 2).join("; ")}`).join(" | ")}
Skills: ${(resumeData.skills || []).slice(0, 12).map((s: { name: string }) => s.name).join(", ")}

JOB DESCRIPTION CONTEXT:
${resume.jobDescription.slice(0, 800)}

EMPLOYER'S QUESTION:
${question.trim()}

Write ONLY the answer — no preamble, no "Answer:", no quotes around it. Just the answer itself.`;

  try {
    const answer = await callClaude(prompt);
    return NextResponse.json({ answer: answer.trim() });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
