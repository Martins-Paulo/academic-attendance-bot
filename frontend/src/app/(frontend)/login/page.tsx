"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Check,
  TrendingUp,
  CalendarDays,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const isRegister = mode === "register";

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [consent, setConsent] = useState(true);

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission & Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Route Guard: Redirect authenticated user immediately to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  // Real-time password criteria for register mode
  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setFieldErrors({});
    setGeneralError(null);
    setInfoMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFieldErrors({});
    setGeneralError(null);
    setInfoMessage(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const fieldName = String(issue.path[0]);
        if (!errors[fieldName]) errors[fieldName] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn(validation.data as LoginFormData);
      if (result.success) {
        router.push("/");
      } else {
        setGeneralError(result.error || "E-mail ou senha incorretos.");
      }
    } catch {
      setGeneralError("Falha na comunicação com o servidor de autenticação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFieldErrors({});
    setGeneralError(null);
    setInfoMessage(null);

    const validation = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const fieldName = String(issue.path[0]);
        if (!errors[fieldName]) errors[fieldName] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp(validation.data as RegisterFormData);
      if (result.success) {
        if (result.requiresEmailConfirmation) {
          setInfoMessage(
            "Conta criada com sucesso! Enviamos um link de confirmação para o seu e-mail. Por favor, confirme para entrar."
          );
        } else {
          router.push("/");
        }
      } else {
        setGeneralError(result.error || "Não foi possível criar sua conta.");
      }
    } catch {
      setGeneralError("Falha na comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      setGeneralError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
        },
      });
      if (error) {
        setGeneralError("Não foi possível iniciar o login com o Google.");
      }
    } catch {
      setGeneralError("Erro ao conectar com o provedor Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !email.includes("@")) {
      setGeneralError("Por favor, preencha seu e-mail acadêmico para receber o link de recuperação.");
      return;
    }

    setIsSubmitting(true);
    setGeneralError(null);
    setInfoMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      });

      if (error) {
        setGeneralError("Não foi possível solicitar a recuperação de senha.");
      } else {
        setInfoMessage("Link de redefinição enviado! Verifique sua caixa de entrada.");
      }
    } catch {
      setGeneralError("Erro ao solicitar redefinição de senha.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enquanto a sessão inicial estiver carregando ou redirecionando
  if (isLoading || user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fffafa",
          padding: "20px",
        }}
      >
        <div className="auth-brand" style={{ marginBottom: "16px", color: "#654985" }}>
          <span className="auth-brand__mark" style={{ background: "#f0e8f9", borderColor: "#e1d4ef" }}>
            <span style={{ background: "#8e68bc" }} />
            <span style={{ background: "#8e68bc" }} />
            <span style={{ background: "#8e68bc" }} />
            <span style={{ background: "#8e68bc" }} />
            <span style={{ background: "#8e68bc" }} />
          </span>
          <span>UniGag</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8a7b8c", fontSize: "14px" }}>
          <Loader2 className="animate-spin" size={18} />
          <span>Sincronizando ambiente acadêmico...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="auth-shell">
      {/* Decorative Orbs */}
      <div className="auth-orb auth-orb--one" />
      <div className="auth-orb auth-orb--two" />
      <div className="auth-orb auth-orb--three" />

      {/* Painel Esquerdo (Branding & Destaque Visual) */}
      <section className="auth-showcase">
        <div className="auth-brand">
          <span className="auth-brand__mark">
            <span />
            <span />
            <span />
            <span />
            <span />
          </span>
          <span>UniGag</span>
        </div>

        <div className="auth-showcase__content">
          <span className="auth-pill">
            <Sparkles size={15} />
            Gagging over good grades & zero missing classes.
          </span>
          <div className="auth-headline">
            Organize o semestre.
            <span>Curta a jornada.</span>
          </div>
          <p>
            Faltas, notas, provas e entregas em um só lugar — feito para você
            aproveitar cada etapa da universidade.
          </p>
          <div className="auth-benefits">
            <span>
              <i><Check size={15} /></i> Frequência sem surpresas
            </span>
            <span>
              <i><Check size={15} /></i> Notas sempre sob controle
            </span>
            <span>
              <i><Check size={15} /></i> Agenda acadêmica inteligente
            </span>
          </div>
        </div>

        <div className="campus-scene" aria-hidden="true">
          <span className="campus-emoji campus-emoji--books">📚</span>
          <span className="campus-emoji campus-emoji--grad">🎓</span>
          <span className="campus-emoji campus-emoji--laptop">💻</span>
          <span className="campus-emoji campus-emoji--coffee">☕</span>
          <div className="campus-card campus-card--grade">
            <span className="campus-card__icon"><TrendingUp size={16} /></span>
            <span><small>Sua média</small><strong>8,7</strong></span>
            <span className="campus-card__trend">+12%</span>
          </div>
          <div className="campus-card campus-card--event">
            <span className="campus-card__icon"><CalendarDays size={16} /></span>
            <span><small>Próxima entrega</small><strong>Projeto final</strong></span>
          </div>
        </div>

        <div className="auth-quote">
          <span>“</span>
          <p>Organização também é uma forma de cuidar de si.</p>
          <small>— Comunidade UniGag</small>
        </div>
      </section>

      {/* Painel Direito (Área de Acesso) */}
      <section className="auth-form-side">
        <div className="auth-mobile-brand">
          <span className="auth-brand__mark">
            <span /><span /><span /><span /><span />
          </span>
          UniGag
        </div>

        <div className="auth-card">
          <div className="auth-card__intro">
            <span className="auth-welcome-emoji">{isRegister ? "🌈" : "👋"}</span>
            <div className="auth-title">
              {isRegister ? "Crie seu espaço no UniGag" : "Que bom ter você de volta!"}
            </div>
            <p>
              {isRegister
                ? "Conte um pouco sobre sua jornada acadêmica."
                : "Entre para continuar organizando seu semestre."}
            </p>
          </div>

          <div className="auth-tabs" role="tablist">
            <button
              aria-selected={!isRegister}
              className={!isRegister ? "is-active" : ""}
              onClick={() => switchMode("login")}
              role="tab"
              type="button"
            >
              Entrar
            </button>
            <button
              aria-selected={isRegister}
              className={isRegister ? "is-active" : ""}
              onClick={() => switchMode("register")}
              role="tab"
              type="button"
            >
              Criar conta
            </button>
          </div>

          {/* Feedback de Erro Geral */}
          {generalError && (
            <div
              style={{
                marginBottom: "16px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(224, 78, 101, 0.08)",
                border: "1px solid rgba(224, 78, 101, 0.25)",
                color: "#c13b52",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              role="alert"
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{generalError}</span>
            </div>
          )}

          {/* Feedback Informativo / Confirmação */}
          {infoMessage && (
            <div
              style={{
                marginBottom: "16px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(102, 187, 139, 0.1)",
                border: "1px solid rgba(102, 187, 139, 0.3)",
                color: "#2d7a50",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              role="status"
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{infoMessage}</span>
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={isRegister ? handleRegister : handleLogin}
            noValidate
          >
            {isRegister && (
              <label className="auth-field">
                <span>Nome completo</span>
                <div style={fieldErrors.fullName ? { borderColor: "#e04e65" } : undefined}>
                  <UserRound size={18} />
                  <input
                    autoComplete="name"
                    disabled={isSubmitting}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Como podemos chamar você?"
                    required
                    type="text"
                    value={fullName}
                  />
                </div>
                {fieldErrors.fullName && (
                  <span style={{ color: "#d9485f", fontSize: "11px", fontWeight: 600, marginTop: "2px" }}>
                    {fieldErrors.fullName}
                  </span>
                )}
              </label>
            )}

            <label className="auth-field">
              <span>E-mail acadêmico</span>
              <div style={fieldErrors.email ? { borderColor: "#e04e65" } : undefined}>
                <Mail size={18} />
                <input
                  autoComplete="email"
                  disabled={isSubmitting}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@universidade.edu.br"
                  required
                  type="email"
                  value={email}
                />
              </div>
              {fieldErrors.email && (
                <span style={{ color: "#d9485f", fontSize: "11px", fontWeight: 600, marginTop: "2px" }}>
                  {fieldErrors.email}
                </span>
              )}
            </label>

            <label className="auth-field">
              <span>Senha</span>
              <div style={fieldErrors.password ? { borderColor: "#e04e65" } : undefined}>
                <LockKeyhole size={18} />
                <input
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  disabled={isSubmitting}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? "Mínimo de 8 caracteres" : "Digite sua senha"}
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  type="button"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span style={{ color: "#d9485f", fontSize: "11px", fontWeight: 600, marginTop: "2px" }}>
                  {fieldErrors.password}
                </span>
              )}
            </label>

            {isRegister && (
              <>
                <label className="auth-field">
                  <span>Confirmar senha</span>
                  <div style={fieldErrors.confirmPassword ? { borderColor: "#e04e65" } : undefined}>
                    <LockKeyhole size={18} />
                    <input
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita sua senha"
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                    />
                    <button
                      aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      type="button"
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <span style={{ color: "#d9485f", fontSize: "11px", fontWeight: 600, marginTop: "2px" }}>
                      {fieldErrors.confirmPassword}
                    </span>
                  )}
                </label>

                {/* Critérios de Segurança da Senha em Tempo Real */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background: "rgba(244, 237, 243, 0.5)",
                    fontSize: "11px",
                    color: "#8a7b8c",
                  }}
                >
                  <span style={{ color: passwordChecks.length ? "#2d7a50" : undefined, display: "flex", alignItems: "center", gap: "4px" }}>
                    ✓ 8+ caracteres
                  </span>
                  <span style={{ color: passwordChecks.upper ? "#2d7a50" : undefined, display: "flex", alignItems: "center", gap: "4px" }}>
                    ✓ 1 maiúscula
                  </span>
                  <span style={{ color: passwordChecks.number ? "#2d7a50" : undefined, display: "flex", alignItems: "center", gap: "4px" }}>
                    ✓ 1 número
                  </span>
                  <span style={{ color: passwordChecks.special ? "#2d7a50" : undefined, display: "flex", alignItems: "center", gap: "4px" }}>
                    ✓ 1 caractere especial
                  </span>
                </div>

                <label className="auth-consent">
                  <input
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    type="checkbox"
                  />
                  <span>
                    Quero receber lembretes importantes por e-mail e WhatsApp.
                  </span>
                </label>
              </>
            )}

            {!isRegister && (
              <div className="auth-form__support">
                <label>
                  <input
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    type="checkbox"
                  />
                  <span>Lembrar de mim</span>
                </label>
                <button onClick={handleForgotPassword} type="button">
                  Esqueci minha senha
                </button>
              </div>
            )}

            <button className="auth-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={17} style={{ marginRight: 8 }} />
                  {isRegister ? "Criando conta..." : "Entrando..."}
                </>
              ) : (
                <>
                  {isRegister ? "Criar minha conta" : "Entrar no UniGag"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>ou continue com</span>
          </div>

          <button
            className="auth-google"
            disabled={isSubmitting}
            onClick={handleGoogleLogin}
            type="button"
          >
            <span>G</span>
            Google
          </button>

          <p className="auth-switch">
            {isRegister ? "Já tem uma conta?" : "Primeira vez por aqui?"}
            <button
              onClick={() => switchMode(isRegister ? "login" : "register")}
              type="button"
            >
              {isRegister ? "Entrar" : "Criar conta grátis"}
            </button>
          </p>
        </div>

        <div className="auth-footer">
          <span>Feito com orgulho para todos os jeitos de aprender</span>
          <span aria-label="Orgulho LGBTQIA+" className="mini-pride">
            <i /><i /><i /><i /><i />
          </span>
        </div>
      </section>
    </main>
  );
}
