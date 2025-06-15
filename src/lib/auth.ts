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
        console.log("GELEN CREDENTIALS:", credentials)
        if (!credentials?.email || !credentials?.password) {
          console.log("Eksik bilgi")
          throw new Error("Email ve şifre gerekli")
        }
        // Veritabanında kullanıcıyı bul
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        console.log("BULUNAN USER:", user)
        if (!user) {
          console.log("Kullanıcı bulunamadı")
          throw new Error("Kullanıcı bulunamadı")
        }
        // Şifreyi karşılaştır
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        console.log("ŞİFRE DOĞRU MU:", isPasswordValid)
        if (!isPasswordValid) {
          console.log("Geçersiz şifre")
          throw new Error("Geçersiz şifre")
        }
        console.log("GİRİŞ BAŞARILI!", user.email)
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
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 gün
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