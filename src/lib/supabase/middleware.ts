import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key",
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh the session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isAuthenticated = !!user;

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
        if (!isAuthenticated) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }

        // If a real user is logged in, but not an admin (mocked check for now)
        const adminEmails = ["admin@clothify.shop", "superadmin@clothify.shop"];
        if (user && user.email && !adminEmails.includes(user.email)) {
            const url = request.nextUrl.clone();
            url.pathname = "/";
            return NextResponse.redirect(url);
        }
    }

    // Protect profile routes
    if (request.nextUrl.pathname.startsWith("/profile")) {
        if (!isAuthenticated) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
    }

    // Prevent authenticated users from seeing login/register
    if (isAuthenticated && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
