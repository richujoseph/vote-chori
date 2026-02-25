import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            const domain = "cy.sjcetpalai.ac.in"
            if (!data.user.email?.endsWith(`@${domain}`)) {
                await supabase.auth.signOut()
                return NextResponse.redirect(`${origin}/login?error=unauthorized_domain`)
            }

            // Sync user to our database if they don't exist
            const email = data.user.email!
            const existingUser = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1)

            if (existingUser.length === 0) {
                await db.insert(users).values({
                    email,
                    name: data.user.user_metadata.full_name || data.user.user_metadata.name || "Student",
                    image: data.user.user_metadata.avatar_url || data.user.user_metadata.picture || null,
                })
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

