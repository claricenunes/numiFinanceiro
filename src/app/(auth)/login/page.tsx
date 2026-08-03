"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/app/dashboard";

  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : "Error signing in. Please try again."
      );
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });
  }

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5" style={{ color: "var(--numi-landing-heading)" }}>
        Welcome back
      </h1>
      <p className="text-sm text-[var(--numi-text-2)] mb-7">Sign in to your account to continue.</p>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading || isSubmitting}
        className="numi-pill-btn numi-pill-btn-outline-dark w-full mb-5 gap-2 py-3"
      >
        <GoogleIcon />
        {isGoogleLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px" style={{ background: "rgba(22, 50, 31, 0.12)" }} />
        <span className="text-xs text-[var(--numi-text-3)]">or with email</span>
        <div className="flex-1 h-px" style={{ background: "rgba(22, 50, 31, 0.12)" }} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--numi-landing-heading)" }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            className="numi-landing-input"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <span className="text-xs text-[var(--numi-expense)]">{errors.email.message}</span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--numi-landing-heading)" }}>
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: "var(--numi-landing-tagline)" }}>
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="numi-landing-input"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <span className="text-xs text-[var(--numi-expense)]">{errors.password.message}</span>
          )}
        </div>

        {/* Server error */}
        {serverError && (
          <div
            role="alert"
            className="rounded-2xl px-4 py-3 text-sm text-[var(--numi-expense)]"
            style={{ background: "rgba(217, 83, 79, 0.08)", border: "1px solid rgba(217, 83, 79, 0.2)" }}
          >
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce w-full mt-1 py-3 text-base disabled:opacity-60 disabled:pointer-events-none"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--numi-text-2)]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold hover:underline" style={{ color: "var(--numi-landing-tagline)" }}>
          Create free account
        </Link>
      </p>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.5 7.52V5.45H1.83a8 8 0 0 0 0 7.1z"/>
      <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.44.45 3.34 1.3l2.5-2.5A8 8 0 0 0 1.83 5.45L4.5 7.52A4.77 4.77 0 0 1 8.98 3.58z"/>
    </svg>
  );
}
