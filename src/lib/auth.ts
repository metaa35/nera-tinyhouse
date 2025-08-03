import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email ve şifre gerekli")
        }
        // Veritabanında kullanıcıyı bul
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        if (!user) {
          throw new Error("Kullanıcı bulunamadı")
        }
        // Şifreyi karşılaştır
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error("Geçersiz şifre")
        }
        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 saat
  },
  jwt: {
    maxAge: 2 * 60 * 60, // 2 saat
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  }
} 