import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    },
  });

  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { section, action, data, id } = body;

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  if (section === "personal") {
    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        location: data.location ?? "",
        linkedIn: data.linkedIn ?? "",
        github: data.github ?? "",
        website: data.website ?? "",
        summary: data.summary ?? "",
      },
    });
    return NextResponse.json(updated);
  }

  if (section === "experience") {
    if (action === "add") {
      const item = await prisma.experience.create({
        data: {
          profileId: profile.id,
          company: data.company,
          title: data.title,
          startDate: data.startDate ?? "",
          endDate: data.endDate ?? "",
          current: data.current ?? false,
          bullets: JSON.stringify(data.bullets ?? []),
          sortOrder: data.sortOrder ?? 0,
        },
      });
      return NextResponse.json(item);
    }
    if (action === "update" && id) {
      const item = await prisma.experience.update({
        where: { id },
        data: {
          company: data.company,
          title: data.title,
          startDate: data.startDate ?? "",
          endDate: data.endDate ?? "",
          current: data.current ?? false,
          bullets: JSON.stringify(data.bullets ?? []),
        },
      });
      return NextResponse.json(item);
    }
    if (action === "delete" && id) {
      await prisma.experience.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }
  }

  if (section === "education") {
    if (action === "add") {
      const item = await prisma.education.create({
        data: {
          profileId: profile.id,
          school: data.school,
          degree: data.degree,
          field: data.field ?? "",
          startDate: data.startDate ?? "",
          endDate: data.endDate ?? "",
          gpa: data.gpa ?? "",
        },
      });
      return NextResponse.json(item);
    }
    if (action === "update" && id) {
      const item = await prisma.education.update({
        where: { id },
        data: {
          school: data.school,
          degree: data.degree,
          field: data.field ?? "",
          startDate: data.startDate ?? "",
          endDate: data.endDate ?? "",
          gpa: data.gpa ?? "",
        },
      });
      return NextResponse.json(item);
    }
    if (action === "delete" && id) {
      await prisma.education.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }
  }

  if (section === "skill") {
    if (action === "add") {
      const item = await prisma.skill.create({
        data: { profileId: profile.id, name: data.name, category: data.category ?? "general" },
      });
      return NextResponse.json(item);
    }
    if (action === "delete" && id) {
      await prisma.skill.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }
  }

  if (section === "project") {
    if (action === "add") {
      const item = await prisma.project.create({
        data: {
          profileId: profile.id,
          name: data.name,
          description: data.description ?? "",
          techStack: JSON.stringify(data.techStack ?? []),
          link: data.link ?? "",
          sortOrder: data.sortOrder ?? 0,
        },
      });
      return NextResponse.json(item);
    }
    if (action === "update" && id) {
      const item = await prisma.project.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description ?? "",
          techStack: JSON.stringify(data.techStack ?? []),
          link: data.link ?? "",
        },
      });
      return NextResponse.json(item);
    }
    if (action === "delete" && id) {
      await prisma.project.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }
  }

  if (section === "certification") {
    if (action === "add") {
      const item = await prisma.certification.create({
        data: {
          profileId: profile.id,
          name: data.name,
          issuer: data.issuer ?? "",
          date: data.date ?? "",
          link: data.link ?? "",
        },
      });
      return NextResponse.json(item);
    }
    if (action === "delete" && id) {
      await prisma.certification.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
