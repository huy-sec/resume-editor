import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callClaude, extractJSON } from "@/lib/claude";
import { buildTailorPromptWithApproach, buildCoverLetterPrompt, buildScoringPrompt, buildKeywordPrompt, buildPersonalityContext, TailorApproach } from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobDescription, approach } = await req.json();
  if (!jobDescription?.trim()) return NextResponse.json({ error: "No job description" }, { status: 400 });

  const selectedApproach: TailorApproach = approach || "achievement-focused";

  // Get profile
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { experiences: true, educations: true, skills: true, projects: true, certifications: true },
  });
  if (!profile) return NextResponse.json({ error: "Please complete your profile first" }, { status: 400 });

  const writingStyleExample = profile.writingStyleExample || undefined;

  const personalityContext = buildPersonalityContext({
    mbti: profile.mbti,
    workStyle: profile.workStyle,
    personalityAnswers: profile.personalityAnswers,
    careerMotivators: profile.careerMotivators,
    communicationStyle: profile.communicationStyle,
    personalBrand: profile.personalBrand,
  }) || undefined;

  const profileJSON = JSON.stringify({
    ...profile,
    experiences: profile.experiences.map((e) => ({ ...e, bullets: JSON.parse(e.bullets) })),
    projects: profile.projects.map((p) => ({ ...p, techStack: JSON.parse(p.techStack) })),
  });

  // 1. Tailor resume
  const tailorResponse = await callClaude(buildTailorPromptWithApproach(profileJSON, jobDescription, selectedApproach, writingStyleExample, personalityContext));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resumeJSON = extractJSON(tailorResponse) as any;

  // 2. Cover letter
  const coverLetterResponse = await callClaude(
    buildCoverLetterPrompt(JSON.stringify(resumeJSON), jobDescription, profile.name, writingStyleExample, personalityContext)
  );
  const coverLetterText = coverLetterResponse.trim();

  // 3. Extract keywords
  const keywordResponse = await callClaude(buildKeywordPrompt(jobDescription));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keywords = extractJSON(keywordResponse) as any;

  // 4. Score humanization
  const textToScore = `${resumeJSON.summary || ""}\n${(resumeJSON.experiences || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .flatMap((e: any) => e.bullets || [])
    .join("\n")}\n${coverLetterText}`;
  const scoreResponse = await callClaude(buildScoringPrompt(textToScore));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scoreData = extractJSON(scoreResponse) as any;

  // Save to DB
  const tailored = await prisma.tailoredResume.create({
    data: {
      userId: session.user.id,
      jobTitle: resumeJSON.jobTitle || keywords.jobTitle || "",
      company: resumeJSON.company || keywords.company || "",
      jobDescription,
      resumeJSON: JSON.stringify(resumeJSON),
      coverLetterText,
      humanizationScore: scoreData.score || 0,
      scoreFlags: JSON.stringify(scoreData.flags || []),
      keywords: JSON.stringify(keywords),
    },
  });

  return NextResponse.json({ id: tailored.id });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, resumeJSON, coverLetterText } = await req.json();

  const existing = await prisma.tailoredResume.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.tailoredResume.update({
    where: { id },
    data: {
      resumeJSON: typeof resumeJSON === "string" ? resumeJSON : JSON.stringify(resumeJSON),
      coverLetterText,
    },
  });
  return NextResponse.json(updated);
}
