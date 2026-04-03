import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const resume = await prisma.tailoredResume.findFirst({
    where: { id, userId: session.user.id },
    select: { jobTitle: true, company: true, jobDescription: true },
  });

  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filename = [resume.jobTitle, resume.company]
    .filter(Boolean)
    .join(" - ")
    .replace(/[^\w\s-]/g, "")
    .trim() || "job-description";

  return new NextResponse(resume.jobDescription, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.txt"`,
    },
  });
}
