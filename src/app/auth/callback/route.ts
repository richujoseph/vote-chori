import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { extractStudentDetails } from '@/lib/auth-utils'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            const allowedDomains = ["cy.sjcetpalai.ac.in", "cc.sjcetpalai.ac.in"]
            const emailDomain = data.user.email?.split("@")[1]
            if (!emailDomain || !allowedDomains.includes(emailDomain)) {
                await supabase.auth.signOut()
                return NextResponse.redirect(`${origin}/login?error=unauthorized_domain`)
            }

            const email = data.user.email!

            // Extract student details from email if it follows the pattern (e.g., 22cs001@cy.sjcetpalai.ac.in)
            try {
                const studentDetails = extractStudentDetails(email);

                const existingUser = await db
                    .select({
                        id: users.id,
                        name: users.name,
                        email: users.email,
                        image: users.image,
                        role: users.role,
                    })
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1)

                if (existingUser.length === 0) {
                    await db.insert(users).values({
                        email,
                        name: data.user.user_metadata.full_name || data.user.user_metadata.name || email.split('@')[0],
                        image: data.user.user_metadata.avatar_url || data.user.user_metadata.picture || null,
                        ...studentDetails,
                    })
                } else {
                    // Update existing user with new details if missing or if name is still placeholder
                    await db.update(users)
                        .set({
                            name: data.user.user_metadata.full_name || data.user.user_metadata.name || (existingUser[0].name === "Student" ? email.split('@')[0] : existingUser[0].name),
                            image: data.user.user_metadata.avatar_url || data.user.user_metadata.picture || existingUser[0].image,
                            ...studentDetails,
                        })
                        .where(eq(users.email, email));
                }
            } catch (dbError) {
                console.error("Auth Callback: Database sync error:", dbError);
                // We proceed even if DB sync fails, but the user might lack permissions/profile
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}

