import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const providers = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Mot de passe", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      });
      if (!user?.password) return null;
      const valid = await bcrypt.compare(
        credentials.password as string,
        user.password
      );
      if (!valid) return null;
      return { id: user.id, email: user.email, name: user.username };
    },
  }),
  ...(process.env.RESEND_API_KEY
    ? [Resend({ from: process.env.EMAIL_FROM!, apiKey: process.env.RESEND_API_KEY })]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    newUser: "/collection",
  },
  providers,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
