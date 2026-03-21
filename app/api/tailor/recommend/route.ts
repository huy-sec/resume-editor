import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callClaude, extractJSON } from "@/lib/claude";
import { buildApproachRecommendationPrompt } from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobDescription } = await req.json();
  if (!jobDescription?.trim()) return NextResponse.json({ error: "No job description" }, { status: 400 });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { experiences: true, skills: true, projects: true },
  });
  if (!profile) return NextResponse.json({ error: "Please complete your profile first" }, { status: 400 });

  const profileJSON = JSON.stringify({
    name: profile.name,
    summary: profile.summary,
    experiences: profile.experiences.map((e) => ({
      company: e.company,
      title: e.title,
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
    })),
    skills: profile.skills.map((s) => s.name),
    projects: profile.projects.map((p) => ({ name: p.name, description: p.description })),
  });

  const response = await callClaude(buildApproachRecommendationPrompt(profileJSON, jobDescription));
  const recommendation = extractJSON(response) as {
    recommended: string;
    reasoning: string;
    alternatives: { approach: string; reason: string }[];
    fitSummary: string;
  };

  return NextResponse.json(recommendation);
}
