import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callClaude, extractJSON } from "@/lib/claude";
import { buildImportPrompt } from "@/lib/prompts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "No text provided" }, { status: 400 });

  const response = await callClaude(buildImportPrompt(text));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = extractJSON(response) as any;

  // Upsert profile
  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {
      name: parsed.name || undefined,
      email: parsed.email || undefined,
      phone: parsed.phone || undefined,
      location: parsed.location || undefined,
      linkedIn: parsed.linkedIn || undefined,
      github: parsed.github || undefined,
      website: parsed.website || undefined,
      summary: parsed.summary || undefined,
    },
    create: {
      userId: session.user.id,
      name: parsed.name || "",
      email: parsed.email || "",
      phone: parsed.phone || "",
      location: parsed.location || "",
      linkedIn: parsed.linkedIn || "",
      github: parsed.github || "",
      website: parsed.website || "",
      summary: parsed.summary || "",
    },
  });

  if (parsed.experiences?.length) {
    await prisma.experience.deleteMany({ where: { profileId: profile.id } });
    for (let i = 0; i < parsed.experiences.length; i++) {
      const e = parsed.experiences[i];
      await prisma.experience.create({
        data: {
          profileId: profile.id,
          company: e.company || "",
          title: e.title || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          current: e.current || false,
          bullets: JSON.stringify(e.bullets || []),
          sortOrder: i,
        },
      });
    }
  }

  if (parsed.skills?.length) {
    await prisma.skill.deleteMany({ where: { profileId: profile.id } });
    for (const s of parsed.skills) {
      await prisma.skill.create({
        data: { profileId: profile.id, name: s.name || "", category: s.category || "general" },
      });
    }
  }

  if (parsed.educations?.length) {
    await prisma.education.deleteMany({ where: { profileId: profile.id } });
    for (const e of parsed.educations) {
      await prisma.education.create({
        data: {
          profileId: profile.id,
          school: e.school || "",
          degree: e.degree || "",
          field: e.field || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          gpa: e.gpa || "",
        },
      });
    }
  }

  if (parsed.projects?.length) {
    await prisma.project.deleteMany({ where: { profileId: profile.id } });
    for (let i = 0; i < parsed.projects.length; i++) {
      const p = parsed.projects[i];
      await prisma.project.create({
        data: {
          profileId: profile.id,
          name: p.name || "",
          description: p.description || "",
          techStack: JSON.stringify(p.techStack || []),
          link: p.link || "",
          sortOrder: i,
        },
      });
    }
  }

  if (parsed.certifications?.length) {
    await prisma.certification.deleteMany({ where: { profileId: profile.id } });
    for (const c of parsed.certifications) {
      await prisma.certification.create({
        data: {
          profileId: profile.id,
          name: c.name || "",
          issuer: c.issuer || "",
          date: c.date || "",
          link: c.link || "",
        },
      });
    }
  }

  return NextResponse.json({ success: true, parsed });
}
