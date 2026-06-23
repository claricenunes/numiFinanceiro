import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Rota de callback OAuth e confirmação de e-mail.
 *
 * Supabase redireciona para /auth/callback?code=xxx após:
 * - Login com Google
 * - Confirmação de e-mail de cadastro
 * - Link de redefinição de senha
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app/dashboard";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Supabase pode redirecionar com erro (ex: link expirado)
  if (error) {
    console.error("[auth/callback]", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription ?? error)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[auth/callback] exchangeCodeForSession:", exchangeError.message);
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }
  }

  // Garante que o next é uma rota interna (evita open redirect)
  const safeNext = next.startsWith("/") ? next : "/app/dashboard";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
