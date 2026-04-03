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

ADDITIONAL VOICE RULES:
- Keep the answer SHORT: 2–4 sentences, or a short paragraph. Never more than ~80 words.
- Match the candidate's natural voice and communication style
- Be genuine and a little personal — not stiff or corporate
- Refer to specific experience or skills from the resume that are relevant
- Do NOT start with "I" as the very first word — rephrase to avoid it
- Do NOT include phrases like "Great question" or "I am excited to"
- Write as if speaking to a real person, not drafting an essay

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
    const answer = await callClaude(prompt, 300);
    return NextResponse.json({ answer: answer.trim() });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
