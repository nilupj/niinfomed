import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const CMS_URL =
  process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8001";

export default NextAuth({
  providers: [
    /* ============================
       🔵 GOOGLE LOGIN
    ============================ */
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    /* ============================
       🔐 DJANGO EMAIL + PASSWORD
    ============================ */
    CredentialsProvider({
      name: "Django",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          const res = await fetch(`${CMS_URL}/api/auth/login/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          // ❌ INVALID LOGIN
          if (!res.ok) {
            const err = await res.text();
            console.error("Django login failed:", err);
            return null;
          }

          const user = await res.json();

          // ❌ CRITICAL CHECK
          if (!user?.id) {
            console.error("Invalid Django response:", user);
            return null;
          }

          // ✅ MUST RETURN USER OBJECT
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            accessToken: user.access || null,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],

  /* ============================
     🔐 SESSION
  ============================ */
  session: {
    strategy: "jwt",
  },

  /* ============================
     🔁 CALLBACKS
  ============================ */
  callbacks: {
    async jwt({ token, user, account }) {
      // Credentials login
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = user.accessToken || null;
      }

      // Google login
      if (account?.provider === "google") {
        token.provider = "google";
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.accessToken = token.accessToken;
      return session;
    },
  },

  /* ============================
     📄 PAGES
  ============================ */
  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
});
