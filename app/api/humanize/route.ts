import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callClaude, extractJSON } from "@/lib/claude";
import { buildHumanizeRewritePrompt, buildScoringPrompt } from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, flags, suggestions } = await req.json();

  const tailored = await prisma.tailoredResume.findFirst({ where: { id, userId: session.user.id } });
  if (!tailored) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });

  const response = await callClaude(
    buildHumanizeRewritePrompt(
      tailored.resumeJSON,
      tailored.coverLetterText,
      flags || [],
      suggestions || [],
      profile?.writingStyleExample || undefined
    )
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rewritten = extractJSON(response) as any;

  // Re-score
  const textToScore = `${rewritten.resumeJSON?.summary || ""}\n${(rewritten.resumeJSON?.experiences || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .flatMap((e: any) => e.bullets || [])
    .join("\n")}\n${rewritten.coverLetterText}`;
  const scoreResponse = await callClaude(buildScoringPrompt(textToScore));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scoreData = extractJSON(scoreResponse) as any;

  // Save updated
  await prisma.tailoredResume.update({
    where: { id },
    data: {
      resumeJSON: JSON.stringify(rewritten.resumeJSON),
      coverLetterText: rewritten.coverLetterText,
      humanizationScore: scoreData.score || 0,
      scoreFlags: JSON.stringify(scoreData.flags || []),
    },
  });

  return NextResponse.json({
    resumeJSON: rewritten.resumeJSON,
    coverLetterText: rewritten.coverLetterText,
    humanizationScore: scoreData.score,
    scoreFlags: scoreData.flags,
    suggestions: scoreData.suggestions,
  });
}
