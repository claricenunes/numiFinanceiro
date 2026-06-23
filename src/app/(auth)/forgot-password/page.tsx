"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
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
      setServerError("Erro ao enviar e-mail. Tente novamente.");
      return;
    }

    setEmailSent(true);
  }

  if (emailSent) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
             style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)" }}>
          <span className="text-2xl">✉️</span>
        </div>
        <h2 className="text-xl font-bold text-[#F1F5F9] mb-2">E-mail enviado</h2>
        <p className="text-sm text-[#94A3B8] mb-6">
          Verifique sua caixa de entrada e clique no link para redefinir sua senha.
        </p>
        <Link href="/login" className="text-sm text-[#34D399] hover:underline">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-[#F1F5F9] mb-6 transition-colors"
      >
        <span aria-hidden>←</span> Voltar
      </Link>

      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">Esqueceu a senha?</h1>
      <p className="text-sm text-[#94A3B8] mb-6">
        Informe seu e-mail e enviaremos um link para criar uma nova senha.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-[#94A3B8]">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            className="input-base"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <span className="text-xs text-[#F87171]">{errors.email.message}</span>
          )}
        </div>

        {serverError && (
          <div
            role="alert"
            className="rounded-lg px-4 py-3 text-sm text-[#F87171]"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
          >
            {serverError}
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Enviando…" : "Enviar link"}
        </button>
      </form>
    </>
  );
}
