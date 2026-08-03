"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setServerError("Error resetting password. The link may have expired.");
      return;
    }

    router.push("/app/dashboard");
    router.refresh();
  }

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5" style={{ color: "var(--numi-landing-heading)" }}>
        New password
      </h1>
      <p className="text-sm text-[var(--numi-text-2)] mb-7">
        Create a secure password for your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--numi-landing-heading)" }}>
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="numi-landing-input"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password
            ? <span className="text-xs text-[var(--numi-expense)]">{errors.password.message}</span>
            : <span className="text-xs text-[var(--numi-text-3)]">At least 8 characters, 1 uppercase letter and 1 number</span>
          }
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: "var(--numi-landing-heading)" }}>
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="numi-landing-input"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="text-xs text-[var(--numi-expense)]">{errors.confirmPassword.message}</span>
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
          {isSubmitting ? "Saving…" : "Save new password"}
        </button>
      </form>
    </>
  );
}
