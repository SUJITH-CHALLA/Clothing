import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // Protect admin routes (TEMPORARILY DISABLED FOR BOT INSPECTION)
    // if (request.nextUrl.pathname.startsWith("/admin")) {
    //     if (!isAuthenticated) {
    //         const url = request.nextUrl.clone();
    //         url.pathname = "/login";
    //         return NextResponse.redirect(url);
    //     }
    //
    //     // If a real user is logged in, but not an admin (mocked check for now)
    //     if (user && user.email !== "admin@clothify.shop") {
    //         const url = request.nextUrl.clone();
    //         url.pathname = "/";
    //         return NextResponse.redirect(url);
    //     }
    // }

    // Protect profile routes (TEMPORARILY DISABLED FOR BOT INSPECTION)
    // if (request.nextUrl.pathname.startsWith("/profile")) {
    //     if (!isAuthenticated) {
    //         const url = request.nextUrl.clone();
    //         url.pathname = "/login";
    //         return NextResponse.redirect(url);
    //     }
    // }

    // Prevent authenticated users from seeing login/register (TEMPORARILY DISABLED FOR BOT INSPECTION)
    // if (isAuthenticated && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
    //     const url = request.nextUrl.clone();
    //     url.pathname = "/";
    //     return NextResponse.redirect(url);
    // }

    return supabaseResponse;
}
