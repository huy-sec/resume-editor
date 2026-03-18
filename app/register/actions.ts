"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function registerAction(formData: FormData) {
  const parsed = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
  }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: "Please check your input. Password must be at least 6 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Email already registered" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: { email: parsed.data.email, passwordHash },
  });

  // Create empty profile
  await prisma.profile.create({
    data: { userId: user.id, name: parsed.data.name, email: parsed.data.email },
  });

  redirect("/login?registered=true");
}
