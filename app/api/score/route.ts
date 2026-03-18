import { auth } from "@/lib/auth";
import { callClaude, extractJSON } from "@/lib/claude";
import { buildScoringPrompt } from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "No text provided" }, { status: 400 });

  const response = await callClaude(buildScoringPrompt(text));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scoreData = extractJSON(response) as any;

  return NextResponse.json({
    score: scoreData.score,
    flags: scoreData.flags,
    suggestions: scoreData.suggestions,
  });
}
