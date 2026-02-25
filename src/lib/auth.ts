import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }) as NextAuthOptions["adapter"],
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "select_account", // Always show account picker with ALL accounts
                    // No "hd" param → shows every Google account, not just college ones
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            const email = user.email;
            if (!email || !email.endsWith("@sjcetpalai.ac.in")) {
                // Reject non-SJCET emails with a clear error
                return "/login?error=AccessDenied";
            }
            return true;
        },
        async session({ session, user }) {
            if (session.user) {
                // Fetch user from our users table to get role
                const dbUser = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, user.email!))
                    .limit(1);

                if (dbUser.length > 0) {
                    session.user.id = dbUser[0].id;
                    session.user.role = dbUser[0].role;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "database",
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
};
