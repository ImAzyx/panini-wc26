"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !username || !password) return;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    redirect("/auth/register?error=exists");
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, username, password: hash } });
  redirect("/auth/login?registered=1");
}
