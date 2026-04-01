import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUSES = ["", "interview", "offer", "rejected"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const record = await prisma.tailoredResume.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.tailoredResume.update({
    where: { id },
    data: { applicationStatus: status },
  });

  return NextResponse.json({ ok: true });
}
