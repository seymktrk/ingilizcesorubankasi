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
      
      // If it's the hardcoded teacher from credentials, just let them in.
      if (user.id === "teacher") {
        return true;
      }

      // Auto-create or fetch user from DB for Google
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
            role: "STUDENT" // Default role for others
          }
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      // Pass the user role to the token if it's available
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role || "STUDENT";
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  }
})

export { handler as GET, handler as POST }
