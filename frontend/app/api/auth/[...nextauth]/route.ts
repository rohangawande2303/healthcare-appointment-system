import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

/**
 * NextAuth Configuration
 * 
 * Uses the CredentialsProvider to authenticate against the Node.js backend.
 * The JWT strategy is used to persist the user session.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Call our Express backend login endpoint
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          const { user, token } = response.data;

          if (user && token) {
            // Return the user object with the token attached
            return {
              ...user,
              accessToken: token,
            };
          }
          return null;
        } catch (error: any) {
          console.error("Login error:", error.response?.data?.message || error.message);
          throw new Error(error.response?.data?.message || "Invalid credentials");
        }
      }
    })
  ],
  callbacks: {
    /**
     * Handle JWT creation and updates
     * Attaches the access token and user role to the JWT
     */
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    /**
     * Expose data to the client-side session
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
