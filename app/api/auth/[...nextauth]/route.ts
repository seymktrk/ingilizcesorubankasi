import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/lib/prisma"

import CredentialsProvider from "next-auth/providers/credentials"

// A simple implementation without the full PrismaAdapter for brevity, 
// normally we would use @next-auth/prisma-adapter
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Teacher Login",
      credentials: {
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.password === "12345") {
          return { id: "teacher", name: "Teacher", email: "teacher@example.com", role: "TEACHER" } as any;
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      // Auto-create or fetch user from DB
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
            role: "TEACHER" // Defaulting to teacher for demo, in real app needs logic
          }
        });
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email }
        });
        if (dbUser) {
          // @ts-ignore
          session.user.id = dbUser.id;
          // @ts-ignore
          session.user.role = dbUser.role;
        }
      }
      return session;
    }
  }
})

export { handler as GET, handler as POST }
