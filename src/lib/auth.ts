import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: string
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
  }
}

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
        try {
          console.log("Authorize başladı:", credentials?.email)
          
          // Hardcoded admin kullanıcısı
          const adminUser = {
            id: "1",
            email: "admin@nerayapi.com",
            name: "Admin",
            password: "$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9Uu", // admin123
            role: "ADMIN" as Role
          }

          if (!credentials?.email || !credentials?.password) {
            console.log("Email veya şifre eksik")
            throw new Error("Email ve şifre gerekli")
          }

          if (credentials.email !== adminUser.email) {
            console.log("Kullanıcı bulunamadı")
            throw new Error("Kullanıcı bulunamadı")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            adminUser.password
          )

          console.log("Şifre doğrulama sonucu:", isPasswordValid)

          if (!isPasswordValid) {
            console.log("Geçersiz şifre")
            throw new Error("Geçersiz şifre")
          }

          console.log("Giriş başarılı, kullanıcı dönüyor")
          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
          }
        } catch (error) {
          console.error("Authorize hatası:", error)
          throw error
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
      console.log("JWT Callback:", { token, user })
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      console.log("Session Callback:", { session, token })
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        }
      }
    }
  }
} 