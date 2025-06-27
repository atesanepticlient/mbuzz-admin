/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import { db } from "./lib/db";

import authConfig from "./auth.config";

export const { signIn, signOut, auth, handlers } = NextAuth({
  trustHost: true,
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },

  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ token, session }: { token: any; session: any }) {
      if (token.sub && session.user) {
        const admin = await db.admin.findUnique({
          where: { id: token.sub },
        });

        if (admin?.password) {
          admin.password = "";
        }

        if (admin) {
          session.user = { ...admin };
        }
      }
      return session;
    },
  },
  // cookies: {
  //   sessionToken: {
  //     name: `__Secure-next-auth.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: "/",
  //       secure: process.env.NODE_ENV === "production",
  //     },
  //   },
  // },
});
