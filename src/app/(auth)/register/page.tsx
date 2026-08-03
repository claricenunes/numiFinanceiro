"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(
        error.message.includes("already registered")
          ? "This email is already registered."
          : "Error creating account. Please try again."
      );
      return;
    }

    setEmailSent(true);
  }

  async function handleGoogleSignup() {
    setIsGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (emailSent) {
    return (
      <div className="text-center">
        <div
          className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: "color-mix(in srgb, var(--numi-landing-accent) 15%, transparent)", border: "1px solid color-mix(in srgb, var(--numi-landing-accent) 35%, transparent)" }}
        >
          <span className="text-2xl">✉️</span>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--numi-landing-heading)" }}>Confirm your email</h2>
        <p className="text-sm text-[var(--numi-text-2)] mb-6">
          We&apos;ve sent a confirmation link to your email. Click it to activate your account.
        </p>
        <Link href="/login" className="text-sm font-semibold hover:underline" style={{ color: "var(--numi-landing-tagline)" }}>
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5" style={{ color: "var(--numi-landing-heading)" }}>
        Create account
      </h1>
      <p className="text-sm text-[var(--numi-text-2)] mb-7">Start organizing your finances today.</p>

      <button
        type="button"
        onClick={handleGoogleSignup}
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
        <Field label="Full name" error={errors.fullName?.message}>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className="numi-landing-input"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            className="numi-landing-input"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field label="Password" error={errors.password?.message}
               hint="At least 8 characters, 1 uppercase letter and 1 number">
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="numi-landing-input"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </Field>

        <Field label="Confirm password" error={errors.confirmPassword?.message}>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="numi-landing-input"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </Field>

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
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--numi-text-2)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold hover:underline" style={{ color: "var(--numi-landing-tagline)" }}>
          Sign in
        </Link>
      </p>
    </>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: "var(--numi-landing-heading)" }}>{label}</label>
      {children}
      {hint && !error && <span className="text-xs text-[var(--numi-text-3)]">{hint}</span>}
      {error && <span className="text-xs text-[var(--numi-expense)]">{error}</span>}
    </div>
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
