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

  // Upsert profile — only fill in fields that are currently empty
  const existing = await prisma.profile.findUnique({ where: { userId: session.user.id } });

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {
      name: existing?.name || parsed.name || undefined,
      email: existing?.email || parsed.email || undefined,
      phone: existing?.phone || parsed.phone || undefined,
      location: existing?.location || parsed.location || undefined,
      linkedIn: existing?.linkedIn || parsed.linkedIn || undefined,
      github: existing?.github || parsed.github || undefined,
      website: existing?.website || parsed.website || undefined,
      summary: existing?.summary || parsed.summary || undefined,
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

  // Append experiences — skip duplicates (same company + title)
  if (parsed.experiences?.length) {
    const existingExp = await prisma.experience.findMany({ where: { profileId: profile.id } });
    const maxOrder = existingExp.reduce((m, e) => Math.max(m, e.sortOrder), -1);
    let orderCounter = maxOrder + 1;
    for (const e of parsed.experiences) {
      const isDuplicate = existingExp.some(
        (ex) =>
          ex.company.toLowerCase() === (e.company || "").toLowerCase() &&
          ex.title.toLowerCase() === (e.title || "").toLowerCase()
      );
      if (!isDuplicate) {
        await prisma.experience.create({
          data: {
            profileId: profile.id,
            company: e.company || "",
            title: e.title || "",
            startDate: e.startDate || "",
            endDate: e.endDate || "",
            current: e.current || false,
            bullets: JSON.stringify(e.bullets || []),
            sortOrder: orderCounter++,
          },
        });
      }
    }
  }

  // Append skills — skip duplicates (same name, case-insensitive)
  if (parsed.skills?.length) {
    const existingSkills = await prisma.skill.findMany({ where: { profileId: profile.id } });
    const existingNames = new Set(existingSkills.map((s) => s.name.toLowerCase()));
    for (const s of parsed.skills) {
      if (!existingNames.has((s.name || "").toLowerCase())) {
        await prisma.skill.create({
          data: { profileId: profile.id, name: s.name || "", category: s.category || "general" },
        });
        existingNames.add((s.name || "").toLowerCase());
      }
    }
  }

  // Append educations — skip duplicates (same school + degree)
  if (parsed.educations?.length) {
    const existingEdu = await prisma.education.findMany({ where: { profileId: profile.id } });
    for (const e of parsed.educations) {
      const isDuplicate = existingEdu.some(
        (ex) =>
          ex.school.toLowerCase() === (e.school || "").toLowerCase() &&
          ex.degree.toLowerCase() === (e.degree || "").toLowerCase()
      );
      if (!isDuplicate) {
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
  }

  // Append projects — skip duplicates (same name)
  if (parsed.projects?.length) {
    const existingProj = await prisma.project.findMany({ where: { profileId: profile.id } });
    const maxOrder = existingProj.reduce((m, p) => Math.max(m, p.sortOrder), -1);
    let orderCounter = maxOrder + 1;
    const existingNames = new Set(existingProj.map((p) => p.name.toLowerCase()));
    for (const p of parsed.projects) {
      if (!existingNames.has((p.name || "").toLowerCase())) {
        await prisma.project.create({
          data: {
            profileId: profile.id,
            name: p.name || "",
            description: p.description || "",
            techStack: JSON.stringify(p.techStack || []),
            link: p.link || "",
            sortOrder: orderCounter++,
          },
        });
        existingNames.add((p.name || "").toLowerCase());
      }
    }
  }

  // Append certifications — skip duplicates (same name)
  if (parsed.certifications?.length) {
    const existingCerts = await prisma.certification.findMany({ where: { profileId: profile.id } });
    const existingNames = new Set(existingCerts.map((c) => c.name.toLowerCase()));
    for (const c of parsed.certifications) {
      if (!existingNames.has((c.name || "").toLowerCase())) {
        await prisma.certification.create({
          data: {
            profileId: profile.id,
            name: c.name || "",
            issuer: c.issuer || "",
            date: c.date || "",
            link: c.link || "",
          },
        });
        existingNames.add((c.name || "").toLowerCase());
      }
    }
  }

  return NextResponse.json({ success: true, parsed });
}
