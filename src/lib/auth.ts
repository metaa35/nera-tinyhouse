import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  debug: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
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
          
          if (!credentials?.email || !credentials?.password) {
            console.log("Email veya şifre eksik")
            throw new Error("Email ve şifre gerekli")
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          console.log("Bulunan kullanıcı:", user)

          if (!user) {
            console.log("Kullanıcı bulunamadı")
            throw new Error("Kullanıcı bulunamadı")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log("Şifre doğrulama sonucu:", isPasswordValid)

          if (!isPasswordValid) {
            console.log("Geçersiz şifre")
            throw new Error("Geçersiz şifre")
          }

          console.log("Giriş başarılı, kullanıcı dönüyor")
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Authorize hatası:", error)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        }
      }
      return token
    },
    async session({ session, token }) {
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