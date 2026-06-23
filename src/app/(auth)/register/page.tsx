"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
    fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Deve conter letra maiúscula")
      .regex(/[0-9]/, "Deve conter número"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
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
          ? "Este e-mail já está cadastrado."
          : "Erro ao criar conta. Tente novamente."
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
        <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
             style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)" }}>
          <span className="text-2xl">✉️</span>
        </div>
        <h2 className="text-xl font-bold text-[#F1F5F9] mb-2">Confirme seu e-mail</h2>
        <p className="text-sm text-[#94A3B8] mb-6">
          Enviamos um link de confirmação para o seu e-mail. Clique nele para ativar sua conta.
        </p>
        <Link href="/login" className="text-sm text-[#34D399] hover:underline">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">Criar conta</h1>
      <p className="text-sm text-[#94A3B8] mb-6">Comece a organizar suas finanças hoje.</p>

      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={isGoogleLoading || isSubmitting}
        className="btn-outline mb-4"
      >
        <GoogleIcon />
        {isGoogleLoading ? "Redirecionando…" : "Continuar com Google"}
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#1E2D45]" />
        <span className="text-xs text-[#475569]">ou com e-mail</span>
        <div className="flex-1 h-px bg-[#1E2D45]" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Field label="Nome completo" error={errors.fullName?.message}>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            className="input-base"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
        </Field>

        <Field label="E-mail" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            className="input-base"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field label="Senha" error={errors.password?.message}
               hint="Mínimo 8 caracteres, 1 maiúscula e 1 número">
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="input-base"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </Field>

        <Field label="Confirmar senha" error={errors.confirmPassword?.message}>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="input-base"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </Field>

        {serverError && (
          <div
            role="alert"
            className="rounded-lg px-4 py-3 text-sm text-[#F87171]"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
          >
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className="btn-primary mt-1"
        >
          {isSubmitting ? "Criando conta…" : "Criar conta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#94A3B8]">
        Já tem conta?{" "}
        <Link href="/login" className="text-[#34D399] font-medium hover:underline">
          Entrar
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
      <label className="text-sm font-medium text-[#94A3B8]">{label}</label>
      {children}
      {hint && !error && <span className="text-xs text-[#475569]">{hint}</span>}
      {error && <span className="text-xs text-[#F87171]">{error}</span>}
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
