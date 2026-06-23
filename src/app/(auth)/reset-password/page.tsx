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
      setServerError("Erro ao redefinir senha. O link pode ter expirado.");
      return;
    }

    router.push("/app/dashboard");
    router.refresh();
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">Nova senha</h1>
      <p className="text-sm text-[#94A3B8] mb-6">
        Crie uma senha segura para sua conta.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-[#94A3B8]">
            Nova senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="input-base"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password
            ? <span className="text-xs text-[#F87171]">{errors.password.message}</span>
            : <span className="text-xs text-[#475569]">Mínimo 8 caracteres, 1 maiúscula e 1 número</span>
          }
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-[#94A3B8]">
            Confirmar nova senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="input-base"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="text-xs text-[#F87171]">{errors.confirmPassword.message}</span>
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
          {isSubmitting ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>
    </>
  );
}
