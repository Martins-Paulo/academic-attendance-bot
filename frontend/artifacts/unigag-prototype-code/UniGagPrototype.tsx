"use client";

import { useMemo, useState, type ReactNode } from "react";
import "./UniGagPrototype.css";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  Camera,
  CalendarCheck2,
  CalendarDays,
  Check,
  CircleHelp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ClipboardCheck,
  Eye,
  EyeOff,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Palette,
  Presentation,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  TrendingUp,
  Trash2,
  University,
  UserPlus,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  title?: string;
};

export type SquadProfile = {
  id: string;
  displayName: string;
  username: string;
  course: string;
  university: string;
  semester: string;
  status: string;
  avatarEmoji: string;
  attendance: number;
  averageGrade: number;
};

function Button({
  children,
  className = "",
  onClick,
  variant = "ghost",
  title,
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant} ${className}`}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

function AuthScreen({ onComplete }: { onComplete: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isRegister = mode === "register";

  return (
    <main className="auth-shell">
      <div className="auth-orb auth-orb--one" />
      <div className="auth-orb auth-orb--two" />
      <div className="auth-orb auth-orb--three" />

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
            <span><i><Check size={15} /></i> Frequência sem surpresas</span>
            <span><i><Check size={15} /></i> Notas sempre sob controle</span>
            <span><i><Check size={15} /></i> Agenda acadêmica inteligente</span>
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

          <div className="auth-tabs">
            <button
              className={!isRegister ? "is-active" : ""}
              onClick={() => setMode("login")}
              type="button"
            >
              Entrar
            </button>
            <button
              className={isRegister ? "is-active" : ""}
              onClick={() => setMode("register")}
              type="button"
            >
              Criar conta
            </button>
          </div>

          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              onComplete();
            }}
          >
            {isRegister && (
              <>
                <label className="auth-photo">
                  <span className="auth-photo__preview">
                    <UserRound size={22} />
                    <i><Camera size={11} /></i>
                  </span>
                  <span>
                    <strong>Foto de perfil</strong>
                    <small>Adicione uma foto para personalizar</small>
                  </span>
                  <input accept="image/*" type="file" />
                </label>

                <label className="auth-field">
                  <span>Nome completo</span>
                  <div>
                    <UserRound size={18} />
                    <input placeholder="Como podemos chamar você?" required />
                  </div>
                </label>
              </>
            )}

            <label className="auth-field">
              <span>E-mail acadêmico</span>
              <div>
                <Mail size={18} />
                <input
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@universidade.edu.br"
                  required
                  type="email"
                  value={email}
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Senha</span>
              <div>
                <LockKeyhole size={18} />
                <input
                  minLength={6}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={isRegister ? "Mínimo de 6 caracteres" : "Digite sua senha"}
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            {isRegister && (
              <div className="auth-form__grid">
                <label className="auth-field auth-field--wide">
                  <span>Universidade e curso</span>
                  <div>
                    <University size={18} />
                    <input placeholder="Ex.: UFMG · Ciência da Computação" required />
                  </div>
                </label>
                <label className="auth-field">
                  <span>Semestre atual</span>
                  <div>
                    <GraduationCap size={18} />
                    <input placeholder="Ex.: 5º" required />
                  </div>
                </label>
                <label className="auth-field">
                  <span>WhatsApp</span>
                  <div>
                    <Smartphone size={18} />
                    <input placeholder="(00) 00000-0000" />
                  </div>
                </label>
              </div>
            )}

            {!isRegister && (
              <div className="auth-form__support">
                <label>
                  <input type="checkbox" />
                  <span>Lembrar de mim</span>
                </label>
                <button type="button">Esqueci minha senha</button>
              </div>
            )}

            {isRegister && (
              <label className="auth-consent">
                <input required type="checkbox" />
                <span>
                  Quero receber lembretes importantes por e-mail e WhatsApp.
                </span>
              </label>
            )}

            <button className="auth-submit" type="submit">
              {isRegister ? "Criar minha conta" : "Entrar no UniGag"}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-divider"><span>ou continue com</span></div>
          <button className="auth-google" onClick={onComplete} type="button">
            <span>G</span>
            Google
          </button>

          <p className="auth-switch">
            {isRegister ? "Já tem uma conta?" : "Primeira vez por aqui?"}
            <button onClick={() => setMode(isRegister ? "login" : "register")} type="button">
              {isRegister ? "Entrar" : "Criar conta grátis"}
            </button>
          </p>
        </div>
        <div className="auth-footer">
          <span>Feito com orgulho para todos os jeitos de aprender</span>
          <span className="mini-pride" aria-label="Orgulho LGBTQIA+">
            <i /><i /><i /><i /><i />
          </span>
        </div>
      </section>
    </main>
  );
}

function IconButton({
  children,
  label,
  onClick,
  className = "",
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      className={`icon-button ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function Input({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
}) {
  return (
    <input
      className="field"
      onChange={(event) => onChange?.(event.target.value)}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  );
}

const initialCourses = [
  {
    id: 1,
    code: "IHC",
    name: "Interação Humano-Computador",
    professor: "Profa. Marina Costa",
    color: "lavender",
    avatar: "diva",
    classes: 24,
    absences: 6,
    limit: 8,
    grade: 8.2,
    schedule: "SEG · QUA  08:00",
  },
  {
    id: 2,
    code: "ES2",
    name: "Engenharia de Software II",
    professor: "Prof. André Nunes",
    color: "blue",
    avatar: "bearded",
    classes: 22,
    absences: 2,
    limit: 10,
    grade: 7.6,
    schedule: "TER · QUI  10:00",
  },
  {
    id: 3,
    code: "BD",
    name: "Banco de Dados",
    professor: "Profa. Helena Luz",
    color: "mint",
    avatar: "capybara",
    classes: 20,
    absences: 1,
    limit: 8,
    grade: 9.1,
    schedule: "SEX  08:00",
  },
  {
    id: 4,
    code: "IA",
    name: "Inteligência Artificial",
    professor: "Prof. Caio Ramos",
    color: "coral",
    avatar: "anime",
    classes: 23,
    absences: 4,
    limit: 9,
    grade: 6.8,
    schedule: "TER · QUI  14:00",
  },
];

const gradeEvolution = [
  { label: "Fev", value: 6.8 },
  { label: "Mar", value: 7.4 },
  { label: "Abr", value: 7.1 },
  { label: "Mai", value: 8.0 },
  { label: "Jun", value: 8.2 },
];

const calendarDays = [
  { day: 26, muted: true },
  { day: 27, muted: true },
  { day: 28, muted: true },
  { day: 1 },
  { day: 2, dot: "mint" },
  { day: 3 },
  { day: 4 },
  { day: 5, dot: "blue" },
  { day: 6 },
  { day: 7, dot: "mint" },
  { day: 8 },
  { day: 9 },
  { day: 10, dot: "coral" },
  { day: 11 },
  { day: 12, dot: "lavender" },
  { day: 13 },
  { day: 14, today: true, dot: "mint" },
  { day: 15 },
  { day: 16 },
  { day: 17 },
  { day: 18, dot: "blue" },
  { day: 19 },
  { day: 20 },
  { day: 21 },
  { day: 22 },
  { day: 23, dot: "amber" },
  { day: 24 },
  { day: 25, dot: "lavender" },
  { day: 26 },
  { day: 27 },
  { day: 28 },
  { day: 29 },
  { day: 30 },
  { day: 31 },
  { day: 1, muted: true },
];

const profileHealthOptions = [
  { emoji: "😎", label: "Radiante" },
  { emoji: "🤩", label: "Inspirada" },
  { emoji: "😊", label: "Equilibrada" },
  { emoji: "😌", label: "Tranquila" },
  { emoji: "💪", label: "Forte" },
  { emoji: "🥳", label: "Celebrando" },
  { emoji: "🤓", label: "Focada" },
  { emoji: "😅", label: "Na correria" },
  { emoji: "😟", label: "Preocupada" },
  { emoji: "😰", label: "Sobrecarregada" },
  { emoji: "😴", label: "Exausta" },
  { emoji: "😭", label: "No limite" },
];

const courseAvatarStyles = [
  { id: "diva", label: "Diva clássica" },
  { id: "bearded", label: "Barbudo elegante" },
  { id: "graduate", label: "Universitária" },
  { id: "popstar", label: "Diva pop" },
  { id: "anime", label: "Anime kawaii" },
  { id: "hero", label: "Herói de anime" },
  { id: "capybara", label: "Capivara zen" },
  { id: "cat", label: "Gato estudioso" },
  { id: "rocker", label: "Roqueira" },
  { id: "wizard", label: "Maga acadêmica" },
  { id: "space", label: "Exploradora espacial" },
  { id: "royal", label: "Rainha do campus" },
];

function StatCard({
  accent,
  icon,
  label,
  children,
  footer,
  onClick,
}: {
  accent: string;
  icon: ReactNode;
  label: string;
  children: ReactNode;
  footer: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button className={`stat-card accent-${accent}`} onClick={onClick} type="button">
      <span className="stat-card__top">
        <span className="stat-card__icon">{icon}</span>
        <MoreHorizontal size={18} />
      </span>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__content">{children}</span>
      <span className="stat-card__footer">{footer}</span>
    </button>
  );
}

type MoodLevel = "confident" | "happy" | "worried" | "critical";

function MoodExpression({ level }: { level: MoodLevel }) {
  if (level === "confident") {
    return (
      <g className="course-avatar__expression">
        <path className="course-avatar__brow" d="M19 29c3-3 7-3 10-1M36 28c3-2 7-1 9 1" />
        <path className="course-avatar__eye" d="M20 33c3 2 6 2 9 0M36 33c3 2 6 2 9 0" />
        <path className="course-avatar__mouth" d="M24 45c5 4 11 4 16-1" />
      </g>
    );
  }
  if (level === "happy") {
    return (
      <g className="course-avatar__expression">
        <path className="course-avatar__eye" d="M20 34c3-4 6-4 9 0M36 34c3-4 6-4 9 0" />
        <path className="course-avatar__mouth" d="M24 44c4 7 12 7 16 0" />
      </g>
    );
  }
  if (level === "worried") {
    return (
      <g className="course-avatar__expression">
        <path className="course-avatar__brow" d="M20 28c3 0 6 1 8 3M37 31c2-2 5-3 8-3" />
        <circle className="course-avatar__pupil" cx="25" cy="35" r="1.8" />
        <circle className="course-avatar__pupil" cx="40" cy="35" r="1.8" />
        <path className="course-avatar__mouth" d="M25 49c4-4 10-4 14 0" />
      </g>
    );
  }
  return (
    <g className="course-avatar__expression">
      <path className="course-avatar__brow" d="M20 30c3 0 6 2 8 4M37 34c2-2 5-4 8-4" />
      <path className="course-avatar__eye" d="M20 36c3-1 6 0 8 2M37 38c2-2 5-3 8-2" />
      <path className="course-avatar__tear" d="M23 38c-3 5-2 9 0 10 3-2 3-6 0-10ZM42 38c-3 6-2 10 0 11 3-2 3-6 0-11Z" />
      <path className="course-avatar__mouth" d="M25 51c4-5 10-5 14 0" />
    </g>
  );
}

function AvatarArtwork({ avatar }: { avatar: string }) {
  switch (avatar) {
    case "bearded":
      return (
        <g className="course-avatar__art course-avatar__art--bearded">
          <path className="avatar-hair avatar-hair--brown" d="M15 26c0-15 9-21 18-21 12 0 19 8 17 23l-5-7c-7 3-15 3-24 0l-6 5Z" />
          <rect className="avatar-skin avatar-skin--medium" x="16" y="14" width="33" height="42" rx="13" />
          <path className="avatar-beard" d="M17 36c2 16 8 23 16 23 9 0 15-8 16-23-5 4-10 6-16 6s-11-2-16-6Z" />
        </g>
      );
    case "graduate":
      return (
        <g className="course-avatar__art course-avatar__art--graduate">
          <path className="avatar-hair avatar-hair--black" d="M11 31C9 13 18 6 32 6s23 8 21 25l-3 24H14l-3-24Z" />
          <ellipse className="avatar-skin avatar-skin--dark" cx="32" cy="35" rx="17" ry="22" />
          <path className="avatar-cap" d="m12 13 20-9 20 9-20 9-20-9Zm10 5v7c7 4 13 4 20 0v-7" />
        </g>
      );
    case "popstar":
      return (
        <g className="course-avatar__art course-avatar__art--popstar">
          <circle className="avatar-ponytail" cx="49" cy="18" r="11" />
          <path className="avatar-hair avatar-hair--pink" d="M13 31C10 13 20 5 33 6c13 1 21 12 17 28l-8-15c-7 5-15 7-27 6l-2 6Z" />
          <path className="avatar-skin avatar-skin--light" d="M16 23c0-10 7-16 16-16s17 7 17 18v12c0 12-7 20-17 20S16 49 16 37V23Z" />
          <path className="avatar-star" d="m50 36 2 4 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1 2-4Z" />
        </g>
      );
    case "anime":
      return (
        <g className="course-avatar__art course-avatar__art--anime">
          <circle className="avatar-pigtail" cx="13" cy="28" r="10" />
          <circle className="avatar-pigtail" cx="51" cy="28" r="10" />
          <ellipse className="avatar-skin avatar-skin--light" cx="32" cy="34" rx="19" ry="23" />
          <path className="avatar-hair avatar-hair--violet" d="M13 29C12 10 23 5 32 5s20 6 19 24c-5-4-8-9-9-14-6 8-15 11-29 14Z" />
          <path className="avatar-bow" d="M24 10c-8-8-12 1-5 7l8-3 5 4 5-4 8 3c7-6 3-15-5-7l-8 8-8-8Z" />
        </g>
      );
    case "hero":
      return (
        <g className="course-avatar__art course-avatar__art--hero">
          <path className="avatar-skin avatar-skin--light" d="m17 24 6-13h19l6 13-3 22-13 12-13-12-2-22Z" />
          <path className="avatar-hair avatar-hair--blue" d="M13 23 20 4l7 8 7-11 5 11 11-8-2 22-8-9-7 7-7-7-13 6Z" />
          <path className="avatar-headband" d="M16 23c10 3 22 3 32 0" />
        </g>
      );
    case "capybara":
      return (
        <g className="course-avatar__art course-avatar__art--capybara">
          <circle className="avatar-capybara-ear" cx="17" cy="17" r="7" />
          <circle className="avatar-capybara-ear" cx="47" cy="17" r="7" />
          <rect className="avatar-capybara-head" x="10" y="13" width="44" height="45" rx="18" />
          <ellipse className="avatar-capybara-muzzle" cx="32" cy="43" rx="11" ry="8" />
          <circle className="avatar-capybara-nose" cx="32" cy="39" r="3" />
        </g>
      );
    case "cat":
      return (
        <g className="course-avatar__art course-avatar__art--cat">
          <path className="avatar-cat-head" d="M12 28 14 5l13 10c3-1 7-1 10 0L50 5l2 23v12c0 12-8 19-20 19s-20-7-20-19V28Z" />
          <path className="avatar-cat-inner" d="m17 12 2 12 7-7-9-5Zm30 0-2 12-7-7 9-5Z" />
          <path className="avatar-whiskers" d="M20 42 6 38m14 8L6 49m38-7 14-4m-14 8 14 3" />
          <path className="avatar-cat-nose" d="m32 40 3 2-3 3-3-3 3-2Z" />
        </g>
      );
    case "rocker":
      return (
        <g className="course-avatar__art course-avatar__art--rocker">
          <path className="avatar-skin avatar-skin--medium" d="M15 25c0-11 7-17 17-17s17 6 17 17v13c0 12-7 20-17 20s-17-8-17-20V25Z" />
          <path className="avatar-mohawk" d="M19 14C20 4 25 0 32 0s12 4 13 14c-4-4-9-6-13-6s-9 2-13 6Z" />
          <circle className="avatar-piercing" cx="47" cy="40" r="2.5" />
        </g>
      );
    case "wizard":
      return (
        <g className="course-avatar__art course-avatar__art--wizard">
          <ellipse className="avatar-skin avatar-skin--light" cx="32" cy="38" rx="16" ry="19" />
          <path className="avatar-wizard-hair" d="M16 37c-5 4-4 12 1 16l5-8c3 11 17 11 20 0l5 8c5-4 6-12 1-16-2 15-30 15-32 0Z" />
          <path className="avatar-wizard-hat" d="m9 22 16-6L33 0l9 16 13 6c-13 6-33 6-46 0Z" />
          <circle className="avatar-hat-star" cx="34" cy="12" r="2.5" />
        </g>
      );
    case "space":
      return (
        <g className="course-avatar__art course-avatar__art--space">
          <circle className="avatar-helmet" cx="32" cy="32" r="27" />
          <ellipse className="avatar-alien" cx="32" cy="35" rx="16" ry="19" />
          <path className="avatar-antenna" d="M32 16V8m0 0 6-5" />
          <circle className="avatar-antenna-tip" cx="39" cy="3" r="3" />
        </g>
      );
    case "royal":
      return (
        <g className="course-avatar__art course-avatar__art--royal">
          <circle className="avatar-afro" cx="16" cy="24" r="10" />
          <circle className="avatar-afro" cx="25" cy="14" r="11" />
          <circle className="avatar-afro" cx="39" cy="14" r="11" />
          <circle className="avatar-afro" cx="48" cy="24" r="10" />
          <ellipse className="avatar-skin avatar-skin--deep" cx="32" cy="36" rx="17" ry="21" />
          <path className="avatar-crown" d="m17 14-3-12 11 7 7-9 7 9 11-7-3 12H17Z" />
        </g>
      );
    default:
      return (
        <g className="course-avatar__art course-avatar__art--diva">
          <path className="avatar-bob" d="M10 32C8 13 18 5 32 5s24 8 22 27l-5 20-8-7H23l-8 7-5-20Z" />
          <ellipse className="avatar-skin avatar-skin--tan" cx="32" cy="35" rx="17" ry="22" />
          <path className="avatar-bob-fringe" d="M15 26C16 12 24 7 34 7c9 0 15 6 16 15-7-1-12-4-15-9-4 8-11 12-20 13Z" />
          <circle className="avatar-gem" cx="12" cy="39" r="3" />
          <circle className="avatar-gem" cx="52" cy="39" r="3" />
        </g>
      );
  }
}

function AttendanceMood({ ratio, avatar = "diva" }: { ratio: number; avatar?: string }) {
  const mood =
    ratio < 0.25
      ? { level: "confident" as MoodLevel, label: "Presença saudável: confiante" }
      : ratio < 0.5
        ? { level: "happy" as MoodLevel, label: "Presença saudável: tranquila" }
        : ratio < 0.75
          ? { level: "worried" as MoodLevel, label: "Presença em atenção: preocupada" }
          : { level: "critical" as MoodLevel, label: "Presença crítica: muito triste" };

  return (
    <span
      aria-label={mood.label}
      className={`attendance-mood attendance-mood--${mood.level}`}
      role="img"
      title={mood.label}
    >
      <svg aria-hidden="true" className={`course-avatar course-avatar--${avatar}`} viewBox="0 0 64 64">
        <ellipse className="course-avatar__shadow" cx="32" cy="60" rx="18" ry="2.5" />
        <g className="course-avatar__performer">
          <AvatarArtwork avatar={avatar} />
          <MoodExpression level={mood.level} />
        </g>
      </svg>
    </span>
  );
}

type GradeMode = "exams" | "mixed" | "bonus" | "direct";
type Assessment = {
  id: number;
  name: string;
  date: string;
  weight: number;
  grade: number | null;
  type: "exam" | "work";
};

function GradeConfiguration({ onSave }: { onSave: () => void }) {
  const [mode, setMode] = useState<GradeMode>("exams");
  const [passingGrade, setPassingGrade] = useState(6);
  const [differentWeights, setDifferentWeights] = useState(false);
  const [examWeight, setExamWeight] = useState(60);
  const [workWeight, setWorkWeight] = useState(40);
  const [extraPoints, setExtraPoints] = useState(0);
  const [directGrade, setDirectGrade] = useState("");
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [simulations, setSimulations] = useState<Record<number, number>>({});
  const [assessments, setAssessments] = useState<Assessment[]>([
    { id: 1, name: "P1", date: "2025-04-10", weight: 0.5, grade: 5.5, type: "exam" },
    { id: 2, name: "P2", date: "2025-06-18", weight: 0.5, grade: null, type: "exam" },
  ]);

  const modeOptions: Array<{
    id: GradeMode;
    title: string;
    description: string;
    icon: ReactNode;
  }> = [
    {
      id: "exams",
      title: "Somente provas",
      description: "Média simples ou ponderada",
      icon: <ClipboardCheck size={19} />,
    },
    {
      id: "mixed",
      title: "Provas + trabalhos",
      description: "Distribua pesos por categoria",
      icon: <Presentation size={19} />,
    },
    {
      id: "bonus",
      title: "Listas e bônus",
      description: "Pontos extras na média final",
      icon: <ListChecks size={19} />,
    },
    {
      id: "direct",
      title: "Nota final direta",
      description: "Sem fórmula predefinida",
      icon: <CircleHelp size={19} />,
    },
  ];

  const rebalance = (
    items: Assessment[],
    type: "exam" | "work",
    totalPercent: number,
  ) => {
    const count = items.filter((item) => item.type === type).length;
    if (!count) return items;
    return items.map((item) =>
      item.type === type ? { ...item, weight: totalPercent / 100 / count } : item,
    );
  };

  const changeMode = (nextMode: GradeMode) => {
    setMode(nextMode);
    setSimulations({});
    if (nextMode === "exams") {
      setAssessments([
        { id: 1, name: "P1", date: "2025-04-10", weight: 0.5, grade: 5.5, type: "exam" },
        { id: 2, name: "P2", date: "2025-06-18", weight: 0.5, grade: null, type: "exam" },
      ]);
    }
    if (nextMode === "mixed" || nextMode === "bonus") {
      setAssessments([
        { id: 1, name: "P1", date: "2025-04-10", weight: 0.3, grade: 5.5, type: "exam" },
        { id: 2, name: "P2", date: "2025-06-18", weight: 0.3, grade: null, type: "exam" },
        {
          id: 3,
          name: "Seminário",
          date: "2025-05-28",
          weight: 0.4,
          grade: null,
          type: "work",
        },
      ]);
      setExamWeight(60);
      setWorkWeight(40);
    }
  };

  const changeExamCount = (count: number) => {
    setAssessments((current) => {
      const existing = current.filter((item) => item.type === "exam");
      return Array.from({ length: count }, (_, index) => {
        const item = existing[index];
        return (
          item ?? {
            id: Date.now() + index,
            name: `P${index + 1}`,
            date: "",
            grade: null,
            type: "exam" as const,
            weight: 1 / count,
          }
        );
      }).map((item) => ({ ...item, weight: 1 / count }));
    });
  };

  const addAssessment = (type: "exam" | "work") => {
    setAssessments((current) => {
      const categoryCount = current.filter((item) => item.type === type).length;
      const next = [
        ...current,
        {
          id: Date.now(),
          name: type === "exam" ? `P${categoryCount + 1}` : `Trabalho ${categoryCount + 1}`,
          date: "",
          grade: null,
          type,
          weight: 0,
        },
      ];
      return rebalance(next, type, type === "exam" ? examWeight : workWeight);
    });
  };

  const updateAssessment = (id: number, patch: Partial<Assessment>) => {
    setAssessments((current) =>
      current.map((assessment) =>
        assessment.id === id ? { ...assessment, ...patch } : assessment,
      ),
    );
  };

  const completed = assessments.filter((item) => item.grade !== null);
  const pending = assessments.filter((item) => item.grade === null);
  const bonus = mode === "bonus" ? extraPoints : 0;
  const accumulated =
    mode === "direct"
      ? Number(directGrade || 0)
      : completed.reduce((sum, item) => sum + (item.grade ?? 0) * item.weight, 0) + bonus;
  const remainingWeight =
    mode === "direct" ? 0 : pending.reduce((sum, item) => sum + item.weight, 0);
  const neededAverage =
    remainingWeight > 0 ? Math.max(0, (passingGrade - accumulated) / remainingWeight) : 0;
  const projected =
    accumulated +
    pending.reduce(
      (sum, item) => sum + (simulations[item.id] ?? 0) * item.weight,
      0,
    );
  const trajectory =
    accumulated >= passingGrade
      ? "safe"
      : remainingWeight === 0
        ? "danger"
        : neededAverage <= 6
          ? "safe"
          : neededAverage <= 8
            ? "warning"
            : "danger";

  return (
    <div className="grade-config">
      <div className="grade-config__top">
        <div className="grade-subject">
          <span className="course__code course__code--lavender">IHC</span>
          <span>
            <strong>Interação Humano-Computador</strong>
            <small>Profa. Marina Costa · 2025.1</small>
          </span>
        </div>
        <label className="passing-grade">
          Média para aprovação
          <span>
            <input
              max="10"
              min="0"
              onChange={(event) => setPassingGrade(Number(event.target.value))}
              step="0.5"
              type="number"
              value={passingGrade}
            />
            / 10
          </span>
        </label>
      </div>

      <div className="grade-section-label">
        <span>1</span>
        Como esta matéria é avaliada?
      </div>
      <div className="grade-mode-grid">
        {modeOptions.map((option) => (
          <button
            className={mode === option.id ? "grade-mode is-active" : "grade-mode"}
            key={option.id}
            onClick={() => changeMode(option.id)}
            type="button"
          >
            <i>{option.icon}</i>
            <span><strong>{option.title}</strong><small>{option.description}</small></span>
            <b>{mode === option.id && <Check size={12} />}</b>
          </button>
        ))}
      </div>

      <div className="formula-panel">
        {mode === "exams" && (
          <>
            <div className="formula-row">
              <label>
                Quantidade de provas
                <select
                  onChange={(event) => changeExamCount(Number(event.target.value))}
                  value={assessments.length}
                >
                  {[2, 3, 4].map((count) => <option key={count} value={count}>{count} provas</option>)}
                </select>
              </label>
              <label className="switch-field">
                <span><strong>Pesos diferentes</strong><small>Cada prova vale uma parcela diferente</small></span>
                <input
                  checked={differentWeights}
                  onChange={(event) => setDifferentWeights(event.target.checked)}
                  type="checkbox"
                />
              </label>
            </div>
            {differentWeights ? (
              <div className="weight-grid">
                {assessments.map((item) => (
                  <label key={item.id}>
                    Peso da {item.name}
                    <span><input
                      min="0"
                      onChange={(event) => updateAssessment(item.id, { weight: Number(event.target.value) / 10 })}
                      step="0.5"
                      type="number"
                      value={(item.weight * 10).toFixed(1)}
                    /> de 10</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="formula-preview">
                <span>Fórmula aplicada</span>
                <strong>({assessments.map((item) => item.name).join(" + ")}) / {assessments.length}</strong>
                <small>Divisão igualitária de {(100 / assessments.length).toFixed(0)}% por prova</small>
              </div>
            )}
          </>
        )}

        {(mode === "mixed" || mode === "bonus") && (
          <>
            <div className="category-weights">
              <label>
                <span><ClipboardCheck size={17} /> Provas</span>
                <strong><input
                  max="100"
                  min="0"
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setExamWeight(value);
                    setAssessments((current) => rebalance(current, "exam", value));
                  }}
                  type="number"
                  value={examWeight}
                />%</strong>
              </label>
              <label>
                <span><Presentation size={17} /> Trabalhos e seminários</span>
                <strong><input
                  max="100"
                  min="0"
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setWorkWeight(value);
                    setAssessments((current) => rebalance(current, "work", value));
                  }}
                  type="number"
                  value={workWeight}
                />%</strong>
              </label>
            </div>
            <div className={examWeight + workWeight === 100 ? "weight-total is-valid" : "weight-total"}>
              <span style={{ width: `${Math.min(examWeight, 100)}%` }} />
              <strong>Total: {examWeight + workWeight}%</strong>
              <small>{examWeight + workWeight === 100 ? "Distribuição correta" : "Os pesos devem somar 100%"}</small>
            </div>
            {mode === "bonus" && (
              <label className="bonus-field">
                <span><Sparkles size={18} /><strong>Pontuação extra / listas</strong><small>Soma diretamente à média final</small></span>
                <b>+ <input
                  max="3"
                  min="0"
                  onChange={(event) => setExtraPoints(Number(event.target.value))}
                  step="0.1"
                  type="number"
                  value={extraPoints}
                /></b>
              </label>
            )}
          </>
        )}

        {mode === "direct" && (
          <div className="direct-grade">
            <CircleHelp size={24} />
            <span><strong>Nota final ou avulsa</strong><small>Use este modo quando a fórmula ainda não foi divulgada.</small></span>
            <label><input
              max="10"
              min="0"
              onChange={(event) => setDirectGrade(event.target.value)}
              placeholder="—"
              step="0.1"
              type="number"
              value={directGrade}
            /> / 10</label>
          </div>
        )}
      </div>

      <div className="grade-section-label">
        <span>2</span>
        Acompanhamento e simulação
      </div>
      <div className="grade-bento">
        <div className={`grade-progress-card grade-progress-card--${trajectory}`}>
          <div className="grade-progress-card__top">
            <span><small>NOTA ACUMULADA</small><strong>{accumulated.toFixed(1)} <i>/ 10,0</i></strong></span>
            <b>{trajectory === "safe" ? "Boa trajetória" : trajectory === "warning" ? "Em andamento" : "Atenção"}</b>
          </div>
          <div className="grade-progress-track">
            <span style={{ width: `${Math.min(accumulated * 10, 100)}%` }} />
            <i style={{ left: `${passingGrade * 10}%` }}><em>Média {passingGrade.toFixed(1)}</em></i>
          </div>
          <p>Você já garantiu <strong>{accumulated.toFixed(1)} pontos</strong> de 10 possíveis no semestre.</p>
        </div>
        <div className="needed-grade-card">
          <span className="needed-grade-card__icon"><TrendingUp size={20} /></span>
          <span>
            <small>QUANTO PRECISO TIRAR?</small>
            <strong>{remainingWeight ? neededAverage.toFixed(1) : accumulated >= passingGrade ? "Aprovado" : "Encerrado"}</strong>
            <p>
              {remainingWeight
                ? `Você fez ${completed.map((item) => `${item.name} (${item.grade?.toFixed(1)})`).join(", ") || "nenhuma avaliação"}. Para passar com média ${passingGrade.toFixed(1)}, precisa de ${neededAverage.toFixed(1)} de média nas ${pending.length} avaliações restantes.`
                : accumulated >= passingGrade
                  ? "Você atingiu a média de aprovação."
                  : "Não há avaliações pendentes para recuperar a média."}
            </p>
          </span>
        </div>
      </div>

      {mode !== "direct" && (
        <div className="assessment-history">
          <div className="assessment-history__header">
            <div><strong>Histórico de avaliações</strong><span>{completed.length} concluídas · {pending.length} pendentes</span></div>
            <div>
              {(mode === "mixed" || mode === "bonus") && (
                <>
                  <Button onClick={() => addAssessment("exam")} variant="ghost"><Plus size={15} /> Prova</Button>
                  <Button onClick={() => addAssessment("work")} variant="ghost"><Plus size={15} /> Atividade</Button>
                </>
              )}
              <Button onClick={() => setSimulationOpen(!simulationOpen)} variant="secondary">
                <Sparkles size={15} /> {simulationOpen ? "Fechar simulação" : "Simular nota"}
              </Button>
            </div>
          </div>
          <div className="assessment-table">
            <div className="assessment-table__head">
              <span>Avaliação</span><span>Data</span><span>Peso</span><span>Status e nota</span><span />
            </div>
            {assessments.map((item) => (
              <div className="assessment-table__row" key={item.id}>
                <span>
                  <i className={`assessment-type assessment-type--${item.type}`}>
                    {item.type === "exam" ? <ClipboardCheck size={15} /> : <Presentation size={15} />}
                  </i>
                  <input
                    aria-label="Nome da avaliação"
                    onChange={(event) => updateAssessment(item.id, { name: event.target.value })}
                    value={item.name}
                  />
                </span>
                <input
                  aria-label={`Data de ${item.name}`}
                  onChange={(event) => updateAssessment(item.id, { date: event.target.value })}
                  type="date"
                  value={item.date}
                />
                <span className="assessment-weight">{(item.weight * 100).toFixed(0)}%</span>
                <label className={item.grade !== null ? "grade-entry is-complete" : "grade-entry"}>
                  <span>{item.grade !== null ? "Concluída" : "Pendente"}</span>
                  <input
                    aria-label={`Nota de ${item.name}`}
                    max="10"
                    min="0"
                    onChange={(event) =>
                      updateAssessment(item.id, {
                        grade: event.target.value === "" ? null : Number(event.target.value),
                      })
                    }
                    placeholder="Nota"
                    step="0.1"
                    type="number"
                    value={item.grade ?? ""}
                  />
                </label>
                <IconButton
                  label={`Excluir ${item.name}`}
                  onClick={() => setAssessments((current) => current.filter((entry) => entry.id !== item.id))}
                >
                  <Trash2 size={15} />
                </IconButton>
                {simulationOpen && item.grade === null && (
                  <label className="simulation-entry">
                    Se eu tirar
                    <input
                      max="10"
                      min="0"
                      onChange={(event) =>
                        setSimulations((current) => ({
                          ...current,
                          [item.id]: Number(event.target.value),
                        }))
                      }
                      placeholder="0,0"
                      step="0.1"
                      type="number"
                      value={simulations[item.id] ?? ""}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
          {simulationOpen && (
            <div className="simulation-result">
              <span><Sparkles size={17} /> Com este cenário, sua média final seria</span>
              <strong>{projected.toFixed(1)}</strong>
              <b className={projected >= passingGrade ? "is-approved" : ""}>
                {projected >= passingGrade ? "Aprovado" : `Faltam ${(passingGrade - projected).toFixed(1)} pontos`}
              </b>
            </div>
          )}
        </div>
      )}

      <div className="grade-config__footer">
        <span>Os cálculos são atualizados automaticamente a cada alteração.</span>
        <Button onClick={onSave} variant="primary"><Check size={17} /> Salvar critérios</Button>
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        aria-modal="true"
        className={wide ? "modal modal--wide" : "modal"}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal__header">
          <div>
            <div className="eyebrow">UniGag</div>
            <div className="modal__title">{title}</div>
          </div>
          <IconButton label="Fechar modal" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}

function GagSquad({ profiles }: { profiles: SquadProfile[] }) {
  const [tab, setTab] = useState<"friends" | "requests" | "invite">("friends");
  const [query, setQuery] = useState("");
  const [privacy, setPrivacy] = useState("selected");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    profiles.slice(0, 2).map((profile) => profile.id),
  );
  const [permissionProfile, setPermissionProfile] = useState<SquadProfile | null>(null);
  const [permissions, setPermissions] = useState({
    attendance: true,
    deadlines: true,
    grades: false,
  });
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, author: "Paulo", text: "Gente, a aula de IA mudou para o laboratório 4.", time: "10:42" },
    { id: 2, author: "Marina", text: "Bora revisar Banco de Dados amanhã às 15h?", time: "11:08" },
  ]);

  const visibleProfiles = profiles.filter((profile) =>
    `${profile.displayName} ${profile.username} ${profile.course} ${profile.university}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const selectedProfiles = profiles.filter((profile) => selectedIds.includes(profile.id));

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <div className="squad-page">
      <section className="squad-hero">
        <div>
          <span className="squad-kicker"><Sparkles size={14} /> CONEXÕES UNIVERSITÁRIAS</span>
          <div className="page-title">Seu Gag Squad</div>
          <p>Estudem juntas, compartilhem prazos e celebrem cada aprovação.</p>
        </div>
        <div className="squad-hero__faces">
          {profiles.slice(0, 4).map((profile, index) => (
            <span key={profile.id} style={{ zIndex: 5 - index }}>{profile.avatarEmoji}</span>
          ))}
          <b>{profiles.length}</b>
        </div>
      </section>

      <section className="squad-toolbar panel">
        <label className="squad-search">
          <Search size={18} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, @usuário, curso ou faculdade..."
            value={query}
          />
        </label>
        <label className="privacy-control">
          <ShieldCheck size={18} />
          <span><small>PRIVACIDADE GERAL</small><strong>
            {privacy === "private" ? "Perfil privado" : privacy === "selected" ? "Amigos selecionados" : "Público para o Squad"}
          </strong></span>
          <select onChange={(event) => setPrivacy(event.target.value)} value={privacy}>
            <option value="private">Privado</option>
            <option value="selected">Amigos selecionados</option>
            <option value="public">Público para o Squad</option>
          </select>
        </label>
      </section>

      <div className="squad-tabs">
        <button className={tab === "friends" ? "is-active" : ""} onClick={() => setTab("friends")} type="button">
          <UsersRound size={17} /> Amigos conectados <span>{profiles.length}</span>
        </button>
        <button className={tab === "requests" ? "is-active" : ""} onClick={() => setTab("requests")} type="button">
          <UserPlus size={17} /> Solicitações pendentes <span>2</span>
        </button>
        <button className={tab === "invite" ? "is-active" : ""} onClick={() => setTab("invite")} type="button">
          <Send size={17} /> Convidar colegas
        </button>
      </div>

      {tab === "friends" && (
        <>
          <section className="friend-grid">
            {visibleProfiles.map((profile) => (
              <article className="friend-card" key={profile.id}>
                <div className="friend-card__top">
                  <button
                    aria-label={`Selecionar ${profile.displayName} para comparação`}
                    className={selectedIds.includes(profile.id) ? "friend-select is-selected" : "friend-select"}
                    onClick={() => toggleSelected(profile.id)}
                    type="button"
                  >
                    {selectedIds.includes(profile.id) && <Check size={13} />}
                  </button>
                  <span className="friend-avatar">{profile.avatarEmoji}</span>
                  <span className={`friend-status-dot friend-status-dot--${profile.status === "Livre" ? "free" : "busy"}`} />
                  <IconButton label={`Permissões de ${profile.displayName}`} onClick={() => setPermissionProfile(profile)}>
                    <Settings size={16} />
                  </IconButton>
                </div>
                <div className="friend-card__identity">
                  <strong>{profile.displayName}</strong>
                  <span>@{profile.username}</span>
                </div>
                <p>{profile.course} · {profile.semester}</p>
                <span className="friend-card__university"><University size={13} /> {profile.university}</span>
                <div className="friend-card__status">
                  <span>{profile.status === "Livre" ? "✨" : profile.status.includes("aula") ? "📚" : "📝"}</span>
                  <strong>{profile.status}</strong>
                </div>
                <div className="friend-card__actions">
                  <Button onClick={() => toggleSelected(profile.id)} variant="secondary">
                    <CalendarCheck2 size={15} /> Comparar
                  </Button>
                  <IconButton label={`Mensagem para ${profile.displayName}`}>
                    <MessageCircle size={16} />
                  </IconButton>
                </div>
              </article>
            ))}
            {!visibleProfiles.length && (
              <div className="squad-empty">
                <Search size={24} />
                <strong>Ninguém apareceu por aqui</strong>
                <span>Tente outro nome, curso ou universidade.</span>
              </div>
            )}
          </section>

          <section className="shared-calendar panel">
            <div className="panel__header">
              <div>
                <div className="panel__title">Calendário em sintonia</div>
                <p>Sobreponha agendas e encontre momentos livres em comum</p>
              </div>
              <div className="calendar-friends">
                {selectedProfiles.map((profile, index) => (
                  <span key={profile.id} className={`calendar-friend calendar-friend--${index + 1}`}>
                    {profile.avatarEmoji} {profile.displayName.split(" ")[0]}
                    <button onClick={() => toggleSelected(profile.id)} type="button"><X size={11} /></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="squad-calendar-layout">
              <div className="squad-week">
                {["SEG 19", "TER 20", "QUA 21", "QUI 22", "SEX 23"].map((day) => (
                  <div className="squad-week__day" key={day}>{day}</div>
                ))}
                {Array.from({ length: 15 }, (_, index) => {
                  const free = [0, 3, 7, 9, 13].includes(index);
                  const shared = [2, 6, 11].includes(index);
                  return (
                    <button
                      className={`squad-slot ${free ? "is-free" : ""} ${shared ? "is-shared" : ""}`}
                      key={index}
                      type="button"
                    >
                      <small>{index < 5 ? "08:00" : index < 10 ? "14:00" : "18:00"}</small>
                      {free && <strong>Livre em comum</strong>}
                      {shared && <><span /><span /><b>Aula</b></>}
                    </button>
                  );
                })}
              </div>
              <aside className="squad-alerts">
                <span className="squad-alerts__label">MATCHES DA SEMANA</span>
                <div className="squad-match squad-match--good">
                  <span>✨</span><div><strong>3 janelas livres em comum</strong><small>Ótimo para um study date.</small></div>
                </div>
                <div className="squad-match squad-match--exam">
                  <span>🎯</span><div><strong>P1 de Algoritmos juntas</strong><small>Você e Paulo · Qui, 22 às 10h</small></div>
                </div>
              </aside>
            </div>
          </section>

          <div className="comparison-grid">
            <section className="panel sync-card">
              <div className="panel__header">
                <div><div className="panel__title">Sintonia de frequência</div><p>Matérias que vocês compartilham</p></div>
                <span className="sync-score">94%</span>
              </div>
              {["Interação Humano-Computador", "Banco de Dados"].map((subject, index) => (
                <div className="sync-subject" key={subject}>
                  <strong>{subject}</strong>
                  <div>
                    <span>Você <i style={{ width: `${96 - index * 3}%` }} /></span>
                    <span>Squad <i style={{ width: `${92 - index * 2}%` }} /></span>
                  </div>
                </div>
              ))}
            </section>
            <section className="panel rank-card">
              <div className="panel__header">
                <div><div className="panel__title">Rank & desempenho amigável</div><p>Competição saudável, sem pressão</p></div>
                <span>🏆</span>
              </div>
              {[{ name: "Marina", score: 8.9, emoji: "👩‍🎓" }, { name: "Você", score: 8.2, emoji: "😎" }, { name: "Paulo", score: 7.8, emoji: "🧔" }].map((person, index) => (
                <div className={person.name === "Você" ? "rank-row is-you" : "rank-row"} key={person.name}>
                  <b>{index + 1}</b><span>{person.emoji}</span><strong>{person.name}</strong><i>{person.score.toFixed(1)}</i>
                </div>
              ))}
              <p className="rank-encouragement">Vocês estão a 0,7 pontos de distância. Que tal uma revisão em dupla?</p>
            </section>
            <section className="panel squad-wall">
              <div className="panel__header">
                <div><div className="panel__title">Mural do Squad</div><p>Avisos rápidos para ninguém perder nada</p></div>
                <MessageCircle size={20} />
              </div>
              <div className="squad-messages">
                {messages.map((item) => (
                  <div className="squad-message" key={item.id}>
                    <span>{item.author === "Paulo" ? "🧔" : "👩‍🎓"}</span>
                    <div><strong>{item.author} <small>{item.time}</small></strong><p>{item.text}</p></div>
                  </div>
                ))}
              </div>
              <form
                className="squad-compose"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!message.trim()) return;
                  setMessages((current) => [...current, { id: Date.now(), author: "Você", text: message, time: "agora" }]);
                  setMessage("");
                }}
              >
                <input onChange={(event) => setMessage(event.target.value)} placeholder="Escreva um aviso para o squad..." value={message} />
                <button aria-label="Enviar mensagem" type="submit"><Send size={16} /></button>
              </form>
            </section>
          </div>
        </>
      )}

      {tab === "requests" && (
        <section className="request-list panel">
          {[{ name: "Bia Nascimento", emoji: "👩🏽‍💻", course: "Design · 3º semestre" }, { name: "Theo Lima", emoji: "🧑🏻‍🎨", course: "Arquitetura · 6º semestre" }].map((person) => (
            <div className="request-row" key={person.name}>
              <span>{person.emoji}</span><div><strong>{person.name}</strong><small>{person.course}</small></div>
              <Button variant="ghost">Agora não</Button><Button variant="primary"><Check size={15} /> Aceitar</Button>
            </div>
          ))}
        </section>
      )}

      {tab === "invite" && (
        <section className="invite-panel panel">
          <span className="invite-panel__icon"><UserPlus size={25} /></span>
          <div><div className="panel__title">Traga seu squad para o UniGag</div><p>Convide colegas por e-mail ou compartilhe seu link pessoal.</p></div>
          <div className="invite-form"><input placeholder="colega@universidade.edu.br" /><Button variant="primary"><Send size={15} /> Enviar convite</Button></div>
          <div className="invite-link"><span>unigag.app/squad/lucasm</span><Button variant="secondary">Copiar link</Button></div>
        </section>
      )}

      {permissionProfile && (
        <Modal onClose={() => setPermissionProfile(null)} title={`Compartilhar com ${permissionProfile.displayName.split(" ")[0]}`}>
          <div className="permission-friend">
            <span>{permissionProfile.avatarEmoji}</span>
            <div><strong>{permissionProfile.displayName}</strong><small>@{permissionProfile.username}</small></div>
          </div>
          <p className="modal__intro">Você decide exatamente o que essa pessoa pode acompanhar.</p>
          <div className="permission-list">
            {[
              { key: "attendance", icon: <CalendarCheck2 size={18} />, title: "Calendário de frequência", text: "Presenças, faltas e aulas canceladas" },
              { key: "deadlines", icon: <CalendarDays size={18} />, title: "Provas e entregas", text: "Cronograma de avaliações e trabalhos" },
              { key: "grades", icon: <TrendingUp size={18} />, title: "Médias e desempenho", text: "Notas acumuladas por matéria" },
            ].map((permission) => (
              <label key={permission.key}>
                <i>{permission.icon}</i><span><strong>{permission.title}</strong><small>{permission.text}</small></span>
                <input
                  checked={permissions[permission.key as keyof typeof permissions]}
                  onChange={(event) => setPermissions((current) => ({ ...current, [permission.key]: event.target.checked }))}
                  type="checkbox"
                />
              </label>
            ))}
          </div>
          <div className="privacy-note"><ShieldCheck size={16} /> Você pode alterar essas permissões quando quiser.</div>
          <div className="modal__actions"><Button onClick={() => setPermissionProfile(null)}>Cancelar</Button><Button onClick={() => setPermissionProfile(null)} variant="primary">Salvar permissões</Button></div>
        </Modal>
      )}
    </div>
  );
}

function Dashboard({
  squadProfiles,
  initialView = "dashboard",
  initialTheme = "light",
}: {
  squadProfiles: SquadProfile[];
  initialView?: "dashboard" | "squad";
  initialTheme?: "light" | "dark" | "psa" | "pride";
}) {
  const [courses, setCourses] = useState(initialCourses);
  const [activeView, setActiveView] = useState<"dashboard" | "squad">(initialView);
  const [theme, setTheme] = useState<"light" | "dark" | "psa" | "pride">(initialTheme);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState<"course" | "attendance" | "event" | "detail" | "profile" | "avatars" | "grades" | null>(
    null,
  );
  const [semester, setSemester] = useState("2025.1");
  const [p1, setP1] = useState("6.5");
  const [target, setTarget] = useState("7.0");
  const [selectedDay, setSelectedDay] = useState(14);
  const [toast, setToast] = useState("");
  const [profileHealth, setProfileHealth] = useState("😎");
  const [profileName, setProfileName] = useState("Lucas Martins");
  const [profileSemester, setProfileSemester] = useState("5º semestre");
  const [profileEducation, setProfileEducation] = useState("UFMG · Ciência da Computação");
  const [avatarCourseId, setAvatarCourseId] = useState(1);

  const overallAttendance = useMemo(() => {
    const total = courses.reduce((sum, course) => sum + course.classes, 0);
    const absences = courses.reduce((sum, course) => sum + course.absences, 0);
    return Math.round(((total - absences) / total) * 100);
  }, [courses]);

  const neededGrade = Math.max(0, Number(target || 0) * 2 - Number(p1 || 0)).toFixed(1);

  const updateAttendance = (id: number, kind: "present" | "absence" | "cancel") => {
    setCourses((current) =>
      current.map((course) => {
        if (course.id !== id) return course;
        if (kind === "present") return { ...course, classes: course.classes + 1 };
        if (kind === "absence")
          return { ...course, classes: course.classes + 1, absences: course.absences + 1 };
        return course;
      }),
    );
    setToast(
      kind === "present"
        ? "Presença registrada com sucesso."
        : kind === "absence"
          ? "Falta registrada. Seu limite foi atualizado."
          : "Aula marcada como cancelada.",
    );
    window.setTimeout(() => setToast(""), 2600);
  };

  return (
    <div className={`app theme-${theme}`}>
      <aside className={sidebarOpen ? "sidebar sidebar--open" : "sidebar"}>
        <div className="brand">
          <span className="brand__mark">
            <span />
            <span />
            <span />
          </span>
          <span className="brand__name">UniGag</span>
          <IconButton
            className="sidebar__close"
            label="Fechar menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={19} />
          </IconButton>
        </div>

        <nav className="nav">
          <div className="nav__label">ORGANIZAÇÃO</div>
          <Button
            className={`nav__item ${activeView === "dashboard" ? "nav__item--active" : ""}`}
            onClick={() => {
              setActiveView("dashboard");
              setSidebarOpen(false);
            }}
          >
            <LayoutDashboard size={19} /> Visão geral
          </Button>
          <Button
            className={`nav__item ${activeView === "squad" ? "nav__item--active" : ""}`}
            onClick={() => {
              setActiveView("squad");
              setSidebarOpen(false);
            }}
          >
            <UsersRound size={19} /> Gag Squad
            <span className="nav__count">{squadProfiles.length}</span>
          </Button>
          <Button className="nav__item" onClick={() => setModal("course")}>
            <BookOpen size={19} /> Disciplinas
            <span className="nav__count">4</span>
          </Button>
          <Button className="nav__item" onClick={() => setModal("event")}>
            <CalendarDays size={19} /> Calendário
          </Button>
          <Button className="nav__item" onClick={() => setModal("grades")}>
            <TrendingUp size={19} /> Notas e médias
          </Button>
          <div className="nav__label nav__label--spaced">SUA CONTA</div>
          <Button className="nav__item" onClick={() => setModal("profile")}>
            <UserRound size={19} /> Meu perfil
          </Button>
          <Button className="nav__item">
            <Settings size={19} /> Configurações
          </Button>
        </nav>

        <div className="sidebar__tip">
          <span className="sidebar__tip-icon">
            <Sparkles size={18} />
          </span>
          <div>
            <strong>Dica do Uni</strong>
            <p>Revise IHC hoje por 25 min para manter seu ritmo.</p>
          </div>
        </div>

        <button className="profile profile--button" onClick={() => setModal("profile")} type="button">
          <div className="avatar" role="img" aria-label={`Saúde da conta: ${profileHealthOptions.find((item) => item.emoji === profileHealth)?.label}`}>
            {profileHealth}
          </div>
          <div className="profile__meta">
            <strong>{profileName}</strong>
            <span>{profileEducation}</span>
          </div>
          <MoreHorizontal size={18} />
        </button>
      </aside>

      {sidebarOpen && <div className="sidebar-shade" onClick={() => setSidebarOpen(false)} />}

      <main className="main">
        <header className="topbar">
          <div className="topbar__mobile">
            <IconButton label="Abrir menu" onClick={() => setSidebarOpen(true)}>
              <Menu size={21} />
            </IconButton>
            <span className="brand__name">UniGag</span>
          </div>
          <label className="search">
            <Search size={18} />
            <input placeholder={activeView === "squad" ? "Buscar pessoa, curso ou faculdade..." : "Buscar matéria, evento ou nota..."} />
            <kbd>⌘ K</kbd>
          </label>
          <div className="topbar__actions">
            <button className="semester-select" type="button">
              <span>Semestre</span>
              <strong>{semester}</strong>
              <ChevronDown size={16} />
            </button>
            <div className="theme-picker">
              <IconButton
                className={themeMenuOpen ? "theme-trigger theme-trigger--active" : "theme-trigger"}
                label="Escolher aparência"
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              >
                {theme === "dark" ? <Moon size={19} /> : theme === "light" ? <Sun size={19} /> : <Palette size={19} />}
              </IconButton>
              {themeMenuOpen && (
                <div className="theme-menu">
                  <div className="theme-menu__title">Aparência</div>
                  {[
                    { id: "light", name: "Neutro", description: "Claro e minimalista" },
                    { id: "dark", name: "Gag Mode", description: "Grafite confortável" },
                    { id: "psa", name: "PSA", description: "Grafite, vinho e neon" },
                    { id: "pride", name: "Pride", description: "Cores vivas e animadas" },
                  ].map((option) => (
                    <button
                      className={`theme-option theme-option--${option.id} ${theme === option.id ? "is-active" : ""}`}
                      key={option.id}
                      onClick={() => {
                        setTheme(option.id as typeof theme);
                        setThemeMenuOpen(false);
                      }}
                      type="button"
                    >
                      <span className="theme-option__swatch">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span className="theme-option__copy">
                        <strong>{option.name}</strong>
                        <small>{option.description}</small>
                      </span>
                      {theme === option.id && <Check size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <IconButton className="notification" label="Notificações">
              <Bell size={19} />
              <span />
            </IconButton>
          </div>
        </header>

        <div className="content">
          {activeView === "squad" ? (
            <GagSquad profiles={squadProfiles} />
          ) : (
          <>
          <section className="welcome">
            <div>
              <div className="eyebrow">QUARTA-FEIRA, 14 DE MAIO</div>
              <div className="page-title">Bom dia, Lucas!</div>
              <p>Você está indo muito bem. Aqui está o resumo do seu semestre.</p>
            </div>
            <Button onClick={() => setModal("attendance")} variant="primary">
              <Check size={18} /> Registrar aula de hoje
            </Button>
          </section>

          <button className="critical-alert" onClick={() => setModal("detail")} type="button">
            <span className="critical-alert__icon">
              <AlertTriangle size={19} />
            </span>
            <span>
              <strong>Atenção com sua frequência em IHC</strong>
              <span>Você está a apenas 2 faltas do limite. Confira os detalhes para se planejar.</span>
            </span>
            <span className="critical-alert__action">
              Ver detalhes <ChevronRight size={17} />
            </span>
          </button>

          <section className="stats-grid">
            <StatCard
              accent="blue"
              footer={
                <>
                  <span className="trend trend--up">+1,2%</span> desde o mês passado
                </>
              }
              icon={<Check size={19} />}
              label="FREQUÊNCIA GERAL"
              onClick={() => setModal("detail")}
            >
              <span className="donut">
                <svg viewBox="0 0 42 42">
                  <circle cx="21" cy="21" fill="none" r="15.9" strokeWidth="4" />
                  <circle
                    cx="21"
                    cy="21"
                    fill="none"
                    r="15.9"
                    strokeDasharray={`${overallAttendance} ${100 - overallAttendance}`}
                    strokeDashoffset="25"
                    strokeWidth="4"
                  />
                </svg>
                <strong>{overallAttendance}%</strong>
              </span>
              <span className="stat-copy">Excelente</span>
            </StatCard>
            <StatCard
              accent="amber"
              footer="IHC precisa da sua atenção"
              icon={<AlertTriangle size={19} />}
              label="LIMITE DE FALTAS"
              onClick={() => setModal("detail")}
            >
              <strong className="big-number">1</strong>
              <span className="stat-copy">matéria em risco</span>
            </StatCard>
            <StatCard
              accent="lavender"
              footer={
                <>
                  <span className="trend trend--up">+0,4</span> no semestre
                </>
              }
              icon={<TrendingUp size={19} />}
              label="MÉDIA GERAL"
              onClick={() => setModal("detail")}
            >
              <strong className="big-number">7,9</strong>
              <span className="stat-copy">de 10,0</span>
            </StatCard>
            <StatCard
              accent="coral"
              footer="Banco de Dados · Projeto final"
              icon={<Clock3 size={19} />}
              label="PRÓXIMA ENTREGA"
              onClick={() => setModal("event")}
            >
              <strong className="big-number">3 dias</strong>
              <span className="stat-copy">até 17 de maio</span>
            </StatCard>
          </section>

          <div className="dashboard-grid">
            <section className="panel attendance-panel">
              <div className="panel__header">
                <div>
                  <div className="panel__title">Frequência por matéria</div>
                  <p>Acompanhe seus limites e registre suas aulas</p>
                </div>
                <div className="panel__actions">
                  <Button onClick={() => setModal("avatars")} variant="ghost">
                    <Sparkles size={17} /> Avatares
                  </Button>
                  <Button onClick={() => setModal("course")} variant="secondary">
                    <Plus size={17} /> Nova matéria
                  </Button>
                </div>
              </div>
              <div className="course-list">
                {courses.map((course) => {
                  const ratio = course.absences / course.limit;
                  const status = ratio >= 0.75 ? "danger" : ratio >= 0.45 ? "warning" : "safe";
                  const statusText =
                    status === "danger" ? "Em risco" : status === "warning" ? "Atenção" : "Seguro";
                  return (
                    <div className="course" key={course.id}>
                      <button className="course__main" onClick={() => setModal("detail")} type="button">
                        <AttendanceMood avatar={course.avatar} ratio={ratio} />
                        <span className={`course__code course__code--${course.color}`}>
                          {course.code}
                        </span>
                        <span className="course__info">
                          <strong>{course.name}</strong>
                          <span>{course.professor} · {course.schedule}</span>
                        </span>
                        <span className="course__progress">
                          <span className="progress__meta">
                            <span>
                              <strong>{course.absences}</strong> de {course.limit} faltas
                            </span>
                            <span className={`status status--${status}`}>{statusText}</span>
                          </span>
                          <span className="progress">
                            <span
                              className={`progress__bar progress__bar--${status}`}
                              style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                            />
                            <span
                              aria-hidden="true"
                              className={`progress__mood progress__mood--${
                                ratio < 0.25
                                  ? "confident"
                                  : ratio < 0.5
                                    ? "happy"
                                    : ratio < 0.75
                                      ? "worried"
                                      : "critical"
                              }`}
                              style={{ left: `calc(${Math.min(ratio * 100, 96)}% - 3px)` }}
                            />
                          </span>
                        </span>
                      </button>
                      <div className="course__actions">
                        <button
                          className="quick-action quick-action--present"
                          onClick={() => updateAttendance(course.id, "present")}
                          type="button"
                        >
                          <Check size={15} /> Presença
                        </button>
                        <button
                          className="quick-action quick-action--absence"
                          onClick={() => updateAttendance(course.id, "absence")}
                          type="button"
                        >
                          <Plus size={15} /> Falta
                        </button>
                        <IconButton
                          label="Marcar aula cancelada"
                          onClick={() => updateAttendance(course.id, "cancel")}
                        >
                          <X size={16} />
                        </IconButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="right-column">
              <section className="panel calculator">
                <div className="panel__header">
                  <div>
                    <div className="panel__title">Quanto preciso tirar?</div>
                    <p>Simule sua próxima nota</p>
                  </div>
                  <span className="panel-icon panel-icon--lavender">
                    <GraduationCap size={19} />
                  </span>
                </div>
                <label className="select-label">
                  Disciplina
                  <button className="fake-select" type="button">
                    Interação Humano-Computador <ChevronDown size={16} />
                  </button>
                </label>
                <div className="calculator__inputs">
                  <label>
                    Nota da P1
                    <Input onChange={setP1} type="number" value={p1} />
                  </label>
                  <label>
                    Média desejada
                    <Input onChange={setTarget} type="number" value={target} />
                  </label>
                </div>
                <div className="result">
                  <span>Você precisa tirar na P2</span>
                  <strong>{neededGrade}</strong>
                  <span className="result__badge">Meta alcançável</span>
                </div>
                <Button className="calculator__configure" onClick={() => setModal("grades")} variant="secondary">
                  <ClipboardCheck size={16} /> Configurar critérios e notas
                </Button>
              </section>

              <section className="panel chart-panel">
                <div className="panel__header">
                  <div>
                    <div className="panel__title">Evolução das notas</div>
                    <p>Média mensal</p>
                  </div>
                  <span className="trend trend--up">+12%</span>
                </div>
                <div className="grade-chart">
                  <ResponsiveContainer height="100%" width="100%">
                    <AreaChart data={gradeEvolution} margin={{ left: -18, right: 4, top: 10 }}>
                      <defs>
                        <linearGradient id="gradeFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="var(--lavender)" stopOpacity={0.34} />
                          <stop offset="100%" stopColor="var(--lavender)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                      <XAxis axisLine={false} dataKey="label" tickLine={false} />
                      <Tooltip />
                      <Area
                        dataKey="value"
                        fill="url(#gradeFill)"
                        stroke="var(--lavender-strong)"
                        strokeWidth={3}
                        type="monotone"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </aside>
          </div>

          <section className="panel calendar-panel">
            <div className="panel__header">
              <div>
                <div className="panel__title">Seu calendário</div>
                <p>Provas, entregas e registros em um só lugar</p>
              </div>
              <div className="calendar-nav">
                <IconButton label="Mês anterior">
                  <ChevronLeft size={17} />
                </IconButton>
                <strong>Maio 2025</strong>
                <IconButton label="Próximo mês">
                  <ChevronRight size={17} />
                </IconButton>
                <Button onClick={() => setModal("event")} variant="secondary">
                  <Plus size={17} /> Novo evento
                </Button>
              </div>
            </div>
            <div className="calendar-layout">
              <div className="calendar">
                {["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"].map((day) => (
                  <span className="calendar__weekday" key={day}>{day}</span>
                ))}
                {calendarDays.map((item, index) => (
                  <button
                    className={`calendar__day ${item.muted ? "is-muted" : ""} ${item.today ? "is-today" : ""} ${selectedDay === item.day && !item.muted ? "is-selected" : ""}`}
                    key={`${item.day}-${index}`}
                    onClick={() => setSelectedDay(item.day)}
                    type="button"
                  >
                    {item.day}
                    {item.dot && <span className={`calendar__dot calendar__dot--${item.dot}`} />}
                  </button>
                ))}
              </div>
              <div className="day-agenda">
                <div className="day-agenda__date">
                  <strong>{selectedDay}</strong>
                  <span>MAI<br />QUARTA</span>
                </div>
                <div className="agenda-item agenda-item--mint">
                  <span className="agenda-item__time">08:00</span>
                  <span><strong>Interação Humano-Computador</strong><small>Presença registrada</small></span>
                </div>
                <div className="agenda-item agenda-item--blue">
                  <span className="agenda-item__time">14:00</span>
                  <span><strong>Revisão para prova de IA</strong><small>Biblioteca · Sala 3</small></span>
                </div>
                <Button onClick={() => setModal("event")} variant="ghost">
                  <Plus size={16} /> Adicionar neste dia
                </Button>
              </div>
            </div>
          </section>
          </>
          )}
        </div>
      </main>

      {toast && (
        <div className="toast">
          <span><Check size={17} /></span>
          {toast}
        </div>
      )}

      {modal === "attendance" && (
        <Modal onClose={() => setModal(null)} title="Registrar aula de hoje">
          <p className="modal__intro">Selecione a disciplina e como a aula aconteceu.</p>
          <div className="today-class">
            <span className="course__code course__code--lavender">IHC</span>
            <span><strong>Interação Humano-Computador</strong><small>08:00–10:00 · Sala B204</small></span>
          </div>
          <div className="modal__actions modal__actions--stack">
            <Button onClick={() => { updateAttendance(1, "present"); setModal(null); }} variant="primary">
              <Check size={18} /> Estive presente
            </Button>
            <Button onClick={() => { updateAttendance(1, "absence"); setModal(null); }} variant="secondary">
              <X size={18} /> Registrar falta
            </Button>
            <Button onClick={() => { updateAttendance(1, "cancel"); setModal(null); }}>
              Aula foi cancelada
            </Button>
          </div>
        </Modal>
      )}

      {modal === "course" && (
        <Modal onClose={() => setModal(null)} title="Cadastrar nova matéria">
          <div className="form-grid">
            <label>Nome da matéria<Input placeholder="Ex.: Cálculo II" /></label>
            <label>Professor(a)<Input placeholder="Nome do professor" /></label>
            <label>Carga horária<Input placeholder="60h" type="number" /></label>
            <label>Limite de faltas<Input placeholder="15h (25%)" type="number" /></label>
            <label className="form-grid__wide">Dias e horários<Input placeholder="Segunda e quarta · 08:00–10:00" /></label>
            <label className="form-grid__wide">Fórmula da média<Input placeholder="P1 × 0.4 + P2 × 0.6" /></label>
          </div>
          <div className="modal__actions">
            <Button onClick={() => setModal(null)}>Cancelar</Button>
            <Button onClick={() => { setModal(null); setToast("Nova matéria adicionada à sua grade."); }} variant="primary">
              <Plus size={17} /> Adicionar matéria
            </Button>
          </div>
        </Modal>
      )}

      {modal === "event" && (
        <Modal onClose={() => setModal(null)} title="Adicionar evento">
          <div className="form-grid">
            <label className="form-grid__wide">Título<Input placeholder="Ex.: Entrega do projeto final" /></label>
            <label>Data<Input type="date" /></label>
            <label>Horário<Input type="time" /></label>
            <label className="form-grid__wide">Disciplina<Input placeholder="Selecione uma disciplina" /></label>
          </div>
          <div className="event-types">
            {["Prova", "Trabalho", "Aula", "Lembrete"].map((type) => (
              <button key={type} type="button">{type}</button>
            ))}
          </div>
          <div className="modal__actions">
            <Button onClick={() => setModal(null)}>Cancelar</Button>
            <Button onClick={() => { setModal(null); setToast("Evento salvo no calendário."); }} variant="primary">
              Salvar evento
            </Button>
          </div>
        </Modal>
      )}

      {modal === "detail" && (
        <Modal onClose={() => setModal(null)} title="Desempenho do semestre">
          <div className="detail-summary">
            <div><span>Frequência</span><strong>{overallAttendance}%</strong></div>
            <div><span>Média geral</span><strong>7,9</strong></div>
            <div><span>Créditos</span><strong>24</strong></div>
          </div>
          <div className="detail-chart">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={[
                    { name: "Presenças", value: overallAttendance },
                    { name: "Faltas", value: 100 - overallAttendance },
                  ]}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  <Cell fill="var(--mint)" />
                  <Cell fill="var(--coral)" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <Button className="modal__full" onClick={() => setModal(null)} variant="primary">Entendi</Button>
        </Modal>
      )}

      {modal === "profile" && (
        <Modal onClose={() => setModal(null)} title="Editar perfil">
          <div className="profile-editor__preview">
            <span className="profile-editor__avatar" role="img" aria-label="Emoji selecionado">
              {profileHealth}
            </span>
            <span>
              <strong>{profileName}</strong>
              <small>
                Saúde da conta: {profileHealthOptions.find((item) => item.emoji === profileHealth)?.label}
              </small>
            </span>
          </div>

          <div className="form-grid profile-editor__fields">
            <label>
              Nome completo
              <Input onChange={setProfileName} value={profileName} />
            </label>
            <label>
              Semestre atual
              <Input onChange={setProfileSemester} value={profileSemester} />
            </label>
            <label className="form-grid__wide">
              Universidade e curso
              <Input onChange={setProfileEducation} value={profileEducation} />
            </label>
          </div>

          <div className="health-picker">
            <div className="health-picker__header">
              <div>
                <strong>Emoji de saúde da conta</strong>
                <span>Como você está se sentindo neste semestre?</span>
              </div>
              <span className="health-picker__selected">
                {profileHealthOptions.find((item) => item.emoji === profileHealth)?.label}
              </span>
            </div>
            <div className="health-picker__grid">
              {profileHealthOptions.map((item) => (
                <button
                  aria-label={`Selecionar ${item.label}`}
                  aria-pressed={profileHealth === item.emoji}
                  className={profileHealth === item.emoji ? "health-option is-selected" : "health-option"}
                  key={item.label}
                  onClick={() => setProfileHealth(item.emoji)}
                  title={item.label}
                  type="button"
                >
                  <span>{item.emoji}</span>
                  <small>{item.label}</small>
                  {profileHealth === item.emoji && <i><Check size={10} /></i>}
                </button>
              ))}
            </div>
          </div>

          <div className="modal__actions">
            <Button onClick={() => setModal(null)}>Cancelar</Button>
            <Button
              onClick={() => {
                setModal(null);
                setToast("Perfil e saúde da conta atualizados.");
              }}
              variant="primary"
            >
              <Check size={17} /> Salvar perfil
            </Button>
          </div>
        </Modal>
      )}

      {modal === "avatars" && (
        <Modal onClose={() => setModal(null)} title="Avatares das matérias">
          <p className="modal__intro">
            Escolha um personagem para representar a saúde da frequência de cada disciplina.
            As expressões mudam conforme você se aproxima do limite de faltas.
          </p>

          <div className="avatar-course-tabs" role="tablist" aria-label="Selecionar matéria">
            {courses.map((course) => (
              <button
                aria-selected={avatarCourseId === course.id}
                className={avatarCourseId === course.id ? "is-active" : ""}
                key={course.id}
                onClick={() => setAvatarCourseId(course.id)}
                role="tab"
                type="button"
              >
                <span className={`course__code course__code--${course.color}`}>{course.code}</span>
                {course.name}
              </button>
            ))}
          </div>

          <div className="avatar-style-heading">
            <span>Estilo do personagem</span>
            <strong>{courses.find((course) => course.id === avatarCourseId)?.name}</strong>
          </div>

          <div className="avatar-style-grid">
            {courseAvatarStyles.map((style) => {
              const selectedCourse = courses.find((course) => course.id === avatarCourseId);
              const isSelected = selectedCourse?.avatar === style.id;
              return (
                <button
                  aria-label={`Usar avatar ${style.label}`}
                  aria-pressed={isSelected}
                  className={isSelected ? "avatar-style-option is-selected" : "avatar-style-option"}
                  key={style.id}
                  onClick={() =>
                    setCourses((current) =>
                      current.map((course) =>
                        course.id === avatarCourseId ? { ...course, avatar: style.id } : course,
                      ),
                    )
                  }
                  type="button"
                >
                  <AttendanceMood avatar={style.id} ratio={0.18} />
                  <span>{style.label}</span>
                  {isSelected && <i><Check size={11} /></i>}
                </button>
              );
            })}
          </div>

          <div className="avatar-health-demo">
            <span>O mesmo avatar reage à frequência:</span>
            <div>
              <span><AttendanceMood avatar={courses.find((course) => course.id === avatarCourseId)?.avatar} ratio={0.1} />Confiante</span>
              <span><AttendanceMood avatar={courses.find((course) => course.id === avatarCourseId)?.avatar} ratio={0.62} />Preocupada</span>
              <span><AttendanceMood avatar={courses.find((course) => course.id === avatarCourseId)?.avatar} ratio={0.9} />Crítica</span>
            </div>
          </div>

          <div className="modal__actions">
            <Button
              onClick={() => {
                setModal(null);
                setToast("Avatares das matérias atualizados.");
              }}
              variant="primary"
            >
              <Check size={17} /> Concluir
            </Button>
          </div>
        </Modal>
      )}

      {modal === "grades" && (
        <Modal onClose={() => setModal(null)} title="Critérios e acompanhamento de notas" wide>
          <GradeConfiguration
            onSave={() => {
              setModal(null);
              setToast("Critérios de nota salvos com sucesso.");
            }}
          />
        </Modal>
      )}
    </div>
  );
}

const prototypeSquadProfiles: SquadProfile[] = [
  { id: "1", displayName: "Marina Costa", username: "marina.codes", course: "Ciência da Computação", university: "UFMG", semester: "5º semestre", status: "Livre", avatarEmoji: "👩‍🎓", attendance: 96, averageGrade: 8.9 },
  { id: "2", displayName: "Paulo Mendes", username: "paulom", course: "Ciência da Computação", university: "UFMG", semester: "5º semestre", status: "Em aula agora", avatarEmoji: "🧔", attendance: 92, averageGrade: 7.8 },
  { id: "3", displayName: "Júlia Rocha", username: "jurocha", course: "Design Digital", university: "PUC Minas", semester: "3º semestre", status: "Estudando para P1", avatarEmoji: "👩🏽‍💻", attendance: 94, averageGrade: 8.5 },
  { id: "4", displayName: "Alex Nascimento", username: "alex.n", course: "Engenharia de Software", university: "UFMG", semester: "7º semestre", status: "Livre", avatarEmoji: "🧑🏻‍🎨", attendance: 89, averageGrade: 8.1 },
];

export default function UniGagPrototype({ squadProfiles = prototypeSquadProfiles }: { squadProfiles?: SquadProfile[] }) {
  const initialScreen =
    typeof window === "undefined"
      ? "login"
      : new URLSearchParams(window.location.search).get("screen") ?? "login";
  const queryTheme =
    typeof window === "undefined"
      ? "light"
      : new URLSearchParams(window.location.search).get("theme") ?? "light";
  const initialTheme = ["light", "dark", "psa", "pride"].includes(queryTheme)
    ? (queryTheme as "light" | "dark" | "psa" | "pride")
    : "light";
  const initialView = initialScreen === "squad" ? "squad" : "dashboard";
  const [authenticated, setAuthenticated] = useState(initialScreen !== "login");

  return authenticated ? (
    <Dashboard
      initialTheme={initialTheme}
      initialView={initialView}
      squadProfiles={squadProfiles}
    />
  ) : (
    <AuthScreen onComplete={() => setAuthenticated(true)} />
  );
}
