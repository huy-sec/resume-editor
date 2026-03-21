import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      experiences: { orderBy: { sortOrder: "asc" } },
      educations: true,
      skills: true,
      projects: { orderBy: { sortOrder: "asc" } },
      certifications: true,
      scrapedSources: true,
    },
  });

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const exportData = {
    exportedAt: new Date().toISOString(),
    personalInfo: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      linkedIn: profile.linkedIn,
      github: profile.github,
      website: profile.website,
      summary: profile.summary,
    },
    writingStyleExample: profile.writingStyleExample,
    experiences: profile.experiences.map((e) => ({
      company: e.company,
      title: e.title,
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      bullets: JSON.parse(e.bullets),
    })),
    educations: profile.educations,
    skills: profile.skills,
    projects: profile.projects.map((p) => ({
      ...p,
      techStack: JSON.parse(p.techStack),
    })),
    certifications: profile.certifications,
    scrapedSources: profile.scrapedSources.map((s) => ({
      sourceType: s.sourceType,
      sourceUrl: s.sourceUrl,
      scrapedAt: s.scrapedAt,
    })),
  };

  const fileName = `${(profile.name || "profile").replace(/\s+/g, "-")}-data-${new Date().toISOString().split("T")[0]}.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
