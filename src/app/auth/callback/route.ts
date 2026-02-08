import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Allowed redirect paths to prevent open redirect attacks
const ALLOWED_REDIRECTS = ["/", "/library", "/settings", "/search", "/live"];

function isValidRedirect(path: string): boolean {
  // Must start with / and not contain protocol indicators
  if (!path.startsWith("/") || path.includes("//") || path.includes(":")) {
    return false;
  }
  // Check against allowlist or allow /podcast/* paths
  return ALLOWED_REDIRECTS.includes(path) || path.startsWith("/podcast/");
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Validate redirect path to prevent open redirect attacks
  const safePath = isValidRedirect(next) ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${safePath}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
