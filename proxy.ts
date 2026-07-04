import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Protect /admin routes
  if (path.startsWith("/admin")) {
    if (!user) {
      const redirectUrl = new URL("/auth/login", request.url);
      // Add security headers before redirect
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('Permissions-Policy', 'geolocation=(), microphone=()');
      response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https: wss:;");
      return NextResponse.redirect(redirectUrl);
    }

    const allowedEmail = process.env.ADMIN_ALLOWED_EMAIL;
    if (allowedEmail && user.email?.toLowerCase() !== allowedEmail.toLowerCase()) {
      // Clear cookies and redirect to login page with error
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("error", "unauthorized");
      const clearedResponse = NextResponse.redirect(redirectUrl);

      // Clear all supabase auth cookies
      request.cookies.getAll().forEach((cookie) => {
        if (cookie.name.startsWith("sb-") || cookie.name.includes("supabase")) {
          clearedResponse.cookies.delete(cookie.name);
        }
      });
      return clearedResponse;
    }
  }

  // Redirect authorized users away from login page
  if (path === "/auth/login") {
    if (user) {
      const allowedEmail = process.env.ADMIN_ALLOWED_EMAIL;
      if (!allowedEmail || user.email?.toLowerCase() === allowedEmail.toLowerCase()) {
        const redirectUrl = new URL("/admin", request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-icon.png|icon.png|opengraph-image.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf|m4a)$).*)",
  ],
};
