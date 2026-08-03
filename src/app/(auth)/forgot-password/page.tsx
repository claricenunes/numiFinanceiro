"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Invalid email"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setServerError("Error sending email. Please try again.");
      return;
    }

    setEmailSent(true);
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
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--numi-landing-heading)" }}>Email sent</h2>
        <p className="text-sm text-[var(--numi-text-2)] mb-6">
          Check your inbox and click the link to reset your password.
        </p>
        <Link href="/login" className="text-sm font-semibold hover:underline" style={{ color: "var(--numi-landing-tagline)" }}>
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--numi-text-2)] hover:text-[var(--numi-landing-heading)] mb-6 transition-colors"
      >
        <span aria-hidden>←</span> Back
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5" style={{ color: "var(--numi-landing-heading)" }}>
        Forgot password?
      </h1>
      <p className="text-sm text-[var(--numi-text-2)] mb-7">
        Enter your email and we&apos;ll send you a link to create a new password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
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
          disabled={isSubmitting}
          className="numi-pill-btn numi-pill-btn-accent numi-cta-bounce w-full py-3 text-base disabled:opacity-60 disabled:pointer-events-none"
        >
          {isSubmitting ? "Sending…" : "Send link"}
        </button>
      </form>
    </>
  );
}
