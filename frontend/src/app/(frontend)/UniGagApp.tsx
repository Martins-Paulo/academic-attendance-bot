"use client";

import { useMemo, useState, useEffect, useCallback, type ReactNode, type CSSProperties } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Moon,
  Plus,
  Save,
  Search,
  Settings2,
  Sparkles,
  Sun,
  TrendingUp,
  Trash2,
  Type,
  UserRound,
  UsersRound,
  X,
  LogIn,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useModalController } from "@/hooks/useModalController";
import type {
  CriteriaModalPayload,
  EventModalPayload,
  AvatarsModalPayload,
} from "@/types/modals";
import { ModalCriteria } from "@/components/modals/ModalCriteria";
import { ModalEventList } from "@/components/modals/ModalEventList";
import { ModalLimits } from "@/components/modals/ModalLimits";
import { ModalEvent } from "@/components/modals/ModalEvent";
import { ModalCourse } from "@/components/modals/ModalCourse";
import { ModalAvatars } from "@/components/modals/ModalAvatars";
import { ModalAttendance } from "@/components/modals/ModalAttendance";
import { ModalProfile } from "@/components/modals/ModalProfile";
import { ModalAuth } from "@/components/modals/ModalAuth";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  title?: string;
  style?: CSSProperties;
};

export type CurrentStudent = {
  id?: string | number;
  name?: string;
  course?: string;
  semester?: string | number;
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

export type EvaluationItem = {
  id?: number;
  subject_id: number;
  name: string;
  category: "exam" | "assignment" | "list" | "project" | "presentation" | "article";
  weight: number | string;
  score: number | string | null;
};

function Button({
  children,
  className = "",
  onClick,
  variant = "ghost",
  title,
  style,
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant} ${className}`}
      onClick={onClick}
      style={style}
      title={title}
      type="button"
    >
      {children}
    </button>
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
    <div
      className={`stat-card accent-${accent}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <span className="stat-card__top">
        <span className="stat-card__icon">{icon}</span>
        <MoreHorizontal size={18} />
      </span>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__content">{children}</span>
      <span className="stat-card__footer">{footer}</span>
    </div>
  );
}

export const courseAvatarStyles = [
  { id: "diva", label: "Diva Pop / Drag" },
  { id: "trans_pride", label: "Trans & Orgulho" },
  { id: "non_binary", label: "Andrógine / Geek" },
  { id: "queer_punk", label: "Queer Punk / Alt" },
  { id: "bearded", label: "Bear Acadêmico" },
  { id: "graduate", label: "Universitária Black" },
  { id: "royal", label: "Afro Queen" },
  { id: "capybara", label: "Capivara Zen" },
  { id: "cat", label: "Gato Estudioso" },
  { id: "wizard", label: "Maga Acadêmica" },
];

type MoodLevel = "confident" | "happy" | "worried" | "critical";

function MoodExpression({ level }: { level: MoodLevel }) {
  if (level === "confident") {
    return (
      <g className="course-avatar__expression">
        <path className="course-avatar__brow" d="M19 28c3-3 7-3 10-1M36 27c3-2 7-1 9 1" />
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
        <circle className="course-avatar__pupil" cx="25" cy="35" r="2" />
        <circle className="course-avatar__pupil" cx="40" cy="35" r="2" />
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
    case "trans_pride":
      return (
        <g className="course-avatar__art">
          <path fill="#5BCEFA" d="M12 28C10 11 20 4 33 4s23 7 21 24l-4 22H14l-2-22Z" />
          <path fill="#F5A9B8" d="M18 16c5-6 18-6 26 2l-3 12c-7-5-16-5-20 0l-3-14Z" />
          <ellipse className="avatar-skin avatar-skin--light" cx="32" cy="35" rx="17" ry="21" />
          <path fill="#FFFFFF" d="m16 22 2 3 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1 2-4Z" />
          <path stroke="#F5A9B8" strokeWidth="2" strokeLinecap="round" d="M22 24c4-2 10-2 13 1" />
        </g>
      );
    case "non_binary":
      return (
        <g className="course-avatar__art">
          <path fill="#3D2952" d="M14 26C12 12 21 5 33 5s20 7 19 21v22H14V26Z" />
          <ellipse className="avatar-skin avatar-skin--tan" cx="32" cy="35" rx="16.5" ry="21" />
          <path fill="#FFF466" d="M16 18c6-5 15-5 22 0-3 6-9 8-16 6l-6-6Z" />
          <circle cx="25" cy="35" r="6" fill="none" stroke="#25272C" strokeWidth="1.8" />
          <circle cx="39" cy="35" r="6" fill="none" stroke="#25272C" strokeWidth="1.8" />
          <path d="M31 35h2" stroke="#25272C" strokeWidth="1.8" />
        </g>
      );
    case "queer_punk":
      return (
        <g className="course-avatar__art">
          <ellipse className="avatar-skin avatar-skin--medium" cx="32" cy="36" rx="17" ry="20" />
          <path fill="#FF1D74" stroke="#8A0038" strokeWidth="1.2" d="M20 18C21 4 25 0 32 0s11 4 12 18c-3-3-8-5-12-5s-9 2-12 5Z" />
          <circle cx="43" cy="28" r="1.8" fill="#5BCEFA" />
          <circle cx="45" cy="29" r="1.8" fill="#5BCEFA" />
          <path d="M32 40a2 2 0 0 1 2 2" fill="none" stroke="#E5C158" strokeWidth="1.4" />
          <rect x="23" y="52" width="18" height="4" rx="2" fill="#25272C" />
          <circle cx="32" cy="54" r="1.5" fill="#E5C158" />
        </g>
      );
    case "bearded":
      return (
        <g className="course-avatar__art">
          <path className="avatar-hair avatar-hair--brown" d="M15 26c0-15 9-21 18-21 12 0 19 8 17 23l-5-7c-7 3-15 3-24 0l-6 5Z" />
          <rect className="avatar-skin avatar-skin--medium" x="16" y="14" width="33" height="42" rx="13" />
          <path className="avatar-beard" d="M17 36c2 16 8 23 16 23 9 0 15-8 16-23-5 4-10 6-16 6s-11-2-16-6Z" />
          <circle cx="25" cy="34" r="5.5" fill="none" stroke="#3D2952" strokeWidth="1.5" />
          <circle cx="39" cy="34" r="5.5" fill="none" stroke="#3D2952" strokeWidth="1.5" />
          <path d="M30.5 34h3" stroke="#3D2952" strokeWidth="1.5" />
        </g>
      );
    case "graduate":
      return (
        <g className="course-avatar__art">
          <path className="avatar-hair avatar-hair--black" d="M11 31C9 13 18 6 32 6s23 8 21 25l-3 24H14l-3-24Z" />
          <ellipse className="avatar-skin avatar-skin--dark" cx="32" cy="35" rx="17" ry="22" />
          <path className="avatar-cap" d="m12 13 20-9 20 9-20 9-20-9Zm10 5v7c7 4 13 4 20 0v-7" />
          <circle cx="13" cy="39" r="3" fill="none" stroke="#E8BF5D" strokeWidth="1.6" />
          <circle cx="51" cy="39" r="3" fill="none" stroke="#E8BF5D" strokeWidth="1.6" />
        </g>
      );
    case "royal":
      return (
        <g className="course-avatar__art">
          <circle className="avatar-afro" cx="16" cy="24" r="10" />
          <circle className="avatar-afro" cx="25" cy="14" r="11" />
          <circle className="avatar-afro" cx="39" cy="14" r="11" />
          <circle className="avatar-afro" cx="48" cy="24" r="10" />
          <ellipse className="avatar-skin avatar-skin--deep" cx="32" cy="36" rx="17" ry="21" />
          <path className="avatar-crown" d="m17 14-3-12 11 7 7-9 7 9 11-7-3 12H17Z" />
        </g>
      );
    case "capybara":
      return (
        <g className="course-avatar__art">
          <circle className="avatar-capybara-ear" cx="17" cy="17" r="7" />
          <circle className="avatar-capybara-ear" cx="47" cy="17" r="7" />
          <rect className="avatar-capybara-head" x="10" y="13" width="44" height="45" rx="18" />
          <ellipse className="avatar-capybara-muzzle" cx="32" cy="43" rx="11" ry="8" />
          <circle className="avatar-capybara-nose" cx="32" cy="39" r="3" />
        </g>
      );
    case "cat":
      return (
        <g className="course-avatar__art">
          <path className="avatar-cat-head" d="M12 28 14 5l13 10c3-1 7-1 10 0L50 5l2 23v12c0 12-8 19-20 19s-20-7-20-19V28Z" />
          <path className="avatar-cat-inner" d="m17 12 2 12 7-7-9-5Zm30 0-2 12-7-7 9-5Z" />
          <path className="avatar-whiskers" d="M20 42 6 38m14 8L6 49m38-7 14-4m-14 8 14 3" />
          <circle cx="25" cy="34" r="5" fill="none" stroke="#865638" strokeWidth="1.4" />
          <circle cx="39" cy="34" r="5" fill="none" stroke="#865638" strokeWidth="1.4" />
        </g>
      );
    case "wizard":
      return (
        <g className="course-avatar__art">
          <ellipse className="avatar-skin avatar-skin--light" cx="32" cy="38" rx="16" ry="19" />
          <path className="avatar-wizard-hair" d="M16 37c-5 4-4 12 1 16l5-8c3 11 17 11 20 0l5 8c5-4 6-12 1-16-2 15-30 15-32 0Z" />
          <path className="avatar-wizard-hat" d="m9 22 16-6L33 0l9 16 13 6c-13 6-33 6-46 0Z" />
          <circle className="avatar-hat-star" cx="34" cy="12" r="2.5" />
        </g>
      );
    default:
      return (
        <g className="course-avatar__art">
          <path className="avatar-bob" d="M10 32C8 13 18 5 32 5s24 8 22 27l-5 20-8-7H23l-8 7-5-20Z" />
          <ellipse className="avatar-skin avatar-skin--tan" cx="32" cy="35" rx="17" ry="22" />
          <path className="avatar-bob-fringe" d="M15 26C16 12 24 7 34 7c9 0 15 6 16 15-7-1-12-4-15-9-4 8-11 12-20 13Z" />
          <circle className="avatar-gem" cx="12" cy="39" r="3" />
          <circle className="avatar-gem" cx="52" cy="39" r="3" />
        </g>
      );
  }
}

export function AttendanceMood({ ratio, avatar = "diva" }: { ratio: number; avatar?: string }) {
  const level: MoodLevel =
    ratio < 0.25 ? "confident" : ratio < 0.5 ? "happy" : ratio < 0.75 ? "worried" : "critical";

  return (
    <span
      className={`attendance-mood attendance-mood--${level}`}
      role="img"
      aria-label={`Humor: ${level}`}
    >
      <svg className="course-avatar" viewBox="0 0 64 64">
        <ellipse className="course-avatar__shadow" cx="32" cy="60" rx="18" ry="2.5" />
        <g className="course-avatar__performer">
          <AvatarArtwork avatar={avatar} />
          <MoodExpression level={level} />
        </g>
      </svg>
    </span>
  );
}

function Dashboard({
  squadProfiles,
  currentStudent,
  initialView = "dashboard",
  initialTheme = "light",
}: {
  squadProfiles: SquadProfile[];
  currentStudent?: CurrentStudent;
  initialView?: "dashboard" | "squad";
  initialTheme?: "light" | "dark" | "psa" | "pride";
}) {
  const [courses, setCourses] = useState<any[]>([]);
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [allSubjectEvaluations, setAllSubjectEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros dos Cards
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | number>("all");
  const [gradeFilter, setGradeFilter] = useState<"all" | number>("all");

  // Matéria selecionada para a calculadora
  const [selectedCalcCourseId, setSelectedCalcCourseId] = useState<number | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [targetGrade, setTargetGrade] = useState("7.0");
  const [isSavingEvaluations, setIsSavingEvaluations] = useState(false);

  const { activeModal, modalPayload, openModal, closeModal, isOpen } = useModalController();

  const [activeView, setActiveView] = useState<"dashboard" | "squad">(initialView);
  const [theme, setTheme] = useState<"light" | "dark" | "psa" | "pride">(initialTheme);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semester] = useState("2026.2");
  const [toast, setToast] = useState("");
  const [profileHealth, setProfileHealth] = useState("😎");
  const [avatarCourseId, setAvatarCourseId] = useState<number | null>(null);

  const [textScale, setTextScale] = useState<"normal" | "large" | "xlarge">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("unigag_text_scale") as any) || "normal";
    }
    return "normal";
  });

  const toggleTextScale = () => {
    const next = textScale === "normal" ? "large" : textScale === "large" ? "xlarge" : "normal";
    setTextScale(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("unigag_text_scale", next);
    }
  };

  const router = useRouter();
  const { user, student, signOut, refreshStudent } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    showToast("Sessão encerrada com sucesso.");
    router.replace("/login");
  };

  const [customProfileName, setCustomProfileName] = useState<string>(
    user
      ? (student?.name || (user.user_metadata?.full_name as string) || "Estudante")
      : (currentStudent?.name || "Paulo Cesar")
  );
  const [customProfileEducation, setCustomProfileEducation] = useState<string>(
    user
      ? (student?.course ? `UFG · ${student.course}` : "UniGag · Perfil Verificado")
      : `UFG · ${currentStudent?.course || "Engenharia de Software"}`
  );
  const [customProfilePhone, setCustomProfilePhone] = useState<string>(
    student?.phone || ""
  );

  useEffect(() => {
    if (user) {
      if (student?.name) setCustomProfileName(student.name);
      if (student?.phone) setCustomProfilePhone(student.phone);
      setCustomProfileEducation(
        student?.course ? `UFG · ${student.course}` : "UniGag · Perfil Verificado"
      );
    } else {
      setCustomProfileName(currentStudent?.name || "Paulo Cesar");
      setCustomProfileEducation(`UFG · ${currentStudent?.course || "Engenharia de Software"}`);
      setCustomProfilePhone("");
    }
  }, [user, student, currentStudent]);

  const profileName = customProfileName;
  const profileEducation = customProfileEducation;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2600);
  }, []);

  // Busca e sincronização com Supabase (com isolamento estrito via RLS para usuário logado)
  const fetchSupabaseData = useCallback(async () => {
    try {
      const { data: dbSubjects } = await supabase.from("subjects").select("*");
      const { data: dbAttendances } = await supabase.from("attendances").select("*");
      const { data: dbAllEvals } = await supabase.from("subject_evaluations").select("*");

      if (dbAllEvals) {
        setAllSubjectEvaluations(dbAllEvals);
      }

      const { data: dbEvents } = await supabase
        .from("academic_events")
        .select("*")
        .order("event_date", { ascending: true });

      if (dbEvents && dbEvents.length > 0) {
        setAllEvents(dbEvents);
        const pending = dbEvents.filter((ev: any) => !ev.completed);
        setNextEvent(pending.length > 0 ? pending[0] : null);
      } else {
        setAllEvents([]);
        setNextEvent(null);
      }

      if (dbSubjects && dbSubjects.length > 0) {
        const colors = ["lavender", "blue", "mint", "coral"];
        const defaultAvatars = ["diva", "trans_pride", "non_binary", "queer_punk", "bearded", "graduate"];

        const savedAvatars: Record<string, string> =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("unigag_subject_avatars") || "{}")
            : {};

        const formatted = dbSubjects.map((sub: any, index: number) => {
          const related =
            dbAttendances?.filter(
              (a: any) => String(a.subject_id) === String(sub.id)
            ) || [];

          const absences = related.filter((a: any) => a.status === "absence").length;
          const presents = related.filter((a: any) => a.status === "present").length;
          const chosenAvatar = savedAvatars[sub.id] || defaultAvatars[index % defaultAvatars.length];

          return {
            id: sub.id,
            code: sub.code || `INF0${index + 1}`,
            name: sub.name,
            professor: "Prof. Responsável",
            avatar: chosenAvatar,
            color: colors[index % colors.length],
            classes: sub.total_classes || 64,
            absences,
            presents,
            grade: 8.0,
            limit: sub.max_absences || 16,
            schedule: "SEG · QUA 08:00",
          };
        });

        setCourses(formatted);

        if (!selectedCalcCourseId && formatted.length > 0) {
          setSelectedCalcCourseId(formatted[0].id);
        }
        if (formatted.length > 0 && !avatarCourseId) {
          setAvatarCourseId(formatted[0].id);
        }
      } else {
        // Usuário conectado sem matérias cadastradas
        setCourses([]);
        setSelectedCalcCourseId(null);
      }
    } catch (e) {
      console.error("Erro ao sincronizar com o Supabase:", e);
    } finally {
      setLoading(false);
    }
  }, [avatarCourseId, selectedCalcCourseId, user]);

  useEffect(() => {
    fetchSupabaseData();
  }, [fetchSupabaseData, user?.id, student?.id]);

  // Carrega as avaliações da matéria selecionada
  const fetchSubjectEvaluations = useCallback(async (courseId: number) => {
    try {
      const { data, error } = await supabase
        .from("subject_evaluations")
        .select("*")
        .eq("subject_id", courseId)
        .order("id", { ascending: true });

      if (error) {
        console.error("Erro ao carregar critérios:", error);
      } else if (data && data.length > 0) {
        const mapped = data.map((it: any) => ({
          ...it,
          score: it.score !== null ? String(it.score).replace(".", ",") : null,
          weight: it.weight !== null ? String(it.weight).replace(".", ",") : "",
        }));
        setEvaluations(mapped as EvaluationItem[]);
      } else {
        setEvaluations([
          { subject_id: courseId, name: "P1", category: "exam", weight: "20", score: "6,0" },
          { subject_id: courseId, name: "P2", category: "exam", weight: "30", score: null },
          { subject_id: courseId, name: "P3", category: "exam", weight: "40", score: null },
          { subject_id: courseId, name: "Listas de Exercícios", category: "list", weight: "10", score: "8,5" },
        ]);
      }
    } catch (err) {
      console.error("Erro inesperado ao buscar critérios:", err);
    }
  }, []);

  useEffect(() => {
    if (selectedCalcCourseId) {
      fetchSubjectEvaluations(selectedCalcCourseId);
    }
  }, [selectedCalcCourseId, fetchSubjectEvaluations]);

  // Sincronização reativa em tempo real via Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel("unigag-realtime-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendances" },
        () => fetchSupabaseData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subjects" },
        () => fetchSupabaseData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subject_evaluations" },
        () => {
          fetchSupabaseData();
          if (selectedCalcCourseId) fetchSubjectEvaluations(selectedCalcCourseId);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "academic_events" },
        () => fetchSupabaseData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSupabaseData, fetchSubjectEvaluations, selectedCalcCourseId]);

  // Salva notas editadas inline na calculadora
  const handleSaveEvaluations = async () => {
    if (!selectedCalcCourseId || isSavingEvaluations) return;

    setIsSavingEvaluations(true);
    try {
      await supabase.from("subject_evaluations").delete().eq("subject_id", selectedCalcCourseId);

      const payload = evaluations.map((ev) => {
        const numWeight = parseFloat(String(ev.weight).replace(",", ".")) || 0;
        const numScore =
          ev.score !== null && String(ev.score).trim() !== ""
            ? parseFloat(String(ev.score).replace(",", "."))
            : null;

        return {
          subject_id: selectedCalcCourseId,
          name: ev.name,
          category: ev.category,
          weight: numWeight,
          score: numScore !== null && !isNaN(numScore) ? numScore : null,
        };
      });

      const { error } = await supabase.from("subject_evaluations").insert(payload);

      if (error) {
        console.error("Erro ao salvar avaliações:", error.message);
        showToast("Erro ao sincronizar notas no Supabase.");
      } else {
        showToast("Critérios e notas sincronizados no banco!");
        await fetchSupabaseData();
        await fetchSubjectEvaluations(selectedCalcCourseId);
      }
    } catch (err) {
      console.error("Erro inesperado ao salvar notas:", err);
      showToast("Erro de comunicação ao sincronizar notas.");
    } finally {
      setIsSavingEvaluations(false);
    }
  };

  // Cálculos dinâmicos com suporte pleno a double / vírgulas
  const gradeSummary = useMemo(() => {
    const totalWeight = evaluations.reduce((sum, item) => {
      const w = parseFloat(String(item.weight).replace(",", ".")) || 0;
      return sum + w;
    }, 0);

    const completed = evaluations.filter((item) => {
      if (item.score === null || item.score === undefined || String(item.score).trim() === "") return false;
      const parsed = parseFloat(String(item.score).replace(",", "."));
      return !isNaN(parsed);
    });

    const pending = evaluations.filter((item) => {
      if (item.score === null || item.score === undefined || String(item.score).trim() === "") return true;
      const parsed = parseFloat(String(item.score).replace(",", "."));
      return isNaN(parsed);
    });

    const currentPoints = completed.reduce((sum, item) => {
      const val = parseFloat(String(item.score).replace(",", ".")) || 0;
      const weight = parseFloat(String(item.weight).replace(",", ".")) || 0;
      return sum + val * (weight / 100);
    }, 0);

    const remainingWeightFrac = pending.reduce((sum, item) => {
      const weight = parseFloat(String(item.weight).replace(",", ".")) || 0;
      return sum + weight / 100;
    }, 0);

    const target = parseFloat(targetGrade.replace(",", ".")) || 7.0;
    const needed = Math.max(0, target - currentPoints);
    const neededAvg = remainingWeightFrac > 0 ? needed / remainingWeightFrac : 0;

    return {
      totalWeight,
      currentPoints: currentPoints.toFixed(2).replace(".", ","),
      neededTotal: needed.toFixed(2).replace(".", ","),
      neededAverage: Math.min(10, neededAvg).toFixed(1).replace(".", ","),
      isFeasible: neededAvg <= 10.0,
      isApproved: currentPoints >= target,
      pendingCount: pending.length,
    };
  }, [evaluations, targetGrade]);

  // CÁLCULO DINÂMICO PARA O CARD 3 COM SUPORTE TOTAL À SELEÇÃO INDIVIDUAL DE CADA MATÉRIA
  const displayedCardGrade = useMemo(() => {
    // 1. Se uma matéria específica foi selecionada no Card 3
    if (gradeFilter !== "all") {
      const targetSubId = Number(gradeFilter);
      const itemsToUse = (selectedCalcCourseId === targetSubId && evaluations.length > 0)
        ? evaluations
        : allSubjectEvaluations.filter((ev: any) => ev.subject_id === targetSubId);

      if (!itemsToUse || itemsToUse.length === 0) {
        return {
          mainScore: "—",
          subtitle: "Sem critérios ou notas lançadas",
        };
      }

      let completedWeight = 0;
      let earnedPoints = 0;
      let doneCount = 0;

      itemsToUse.forEach((it: any) => {
        if (it.score !== null && it.score !== undefined && String(it.score).trim() !== "") {
          const s = parseFloat(String(it.score).replace(",", "."));
          const w = parseFloat(String(it.weight).replace(",", ".")) || 0;
          if (!isNaN(s)) {
            earnedPoints += s * (w / 100);
            completedWeight += w;
            doneCount++;
          }
        }
      });

      if (completedWeight === 0) {
        return {
          mainScore: "0,0",
          subtitle: "Nenhuma avaliação feita ainda",
        };
      }

      // Média real ponderada no momento
      const currentAverage = (earnedPoints / (completedWeight / 100)).toFixed(1).replace(".", ",");
      return {
        mainScore: currentAverage,
        subtitle: `${earnedPoints.toFixed(2).replace(".", ",")} de 10,0 garantidos (${doneCount} avaliações)`,
      };
    }

    // 2. Se está em "Média Geral do Semestre"
    if (courses.length === 0) {
      return { mainScore: "—", subtitle: "Sem matérias cadastradas" };
    }

    let totalPointsAllCourses = 0;
    let countedCourses = 0;

    courses.forEach((c) => {
      const items = (selectedCalcCourseId === c.id && evaluations.length > 0)
        ? evaluations
        : allSubjectEvaluations.filter((ev: any) => ev.subject_id === c.id);

      let subCompletedWeight = 0;
      let subEarned = 0;

      items.forEach((it: any) => {
        if (it.score !== null && it.score !== undefined && String(it.score).trim() !== "") {
          const s = parseFloat(String(it.score).replace(",", "."));
          const w = parseFloat(String(it.weight).replace(",", ".")) || 0;
          if (!isNaN(s)) {
            subEarned += s * (w / 100);
            subCompletedWeight += w;
          }
        }
      });

      if (subCompletedWeight > 0) {
        totalPointsAllCourses += (subEarned / (subCompletedWeight / 100));
        countedCourses++;
      }
    });

    if (countedCourses === 0) {
      return {
        mainScore: "—",
        subtitle: "Aguardando primeiras notas",
      };
    }

    const overallSemAvg = (totalPointsAllCourses / countedCourses).toFixed(1).replace(".", ",");
    return {
      mainScore: overallSemAvg,
      subtitle: `Média de ${countedCourses} ${countedCourses === 1 ? "matéria com nota" : "matérias com nota"}`,
    };
  }, [gradeFilter, selectedCalcCourseId, evaluations, allSubjectEvaluations, courses]);

  const handleToggleEventStatus = async (eventId: number, completedState: boolean) => {
    // 1. Atualização otimista imediata na interface
    setAllEvents((prev) => {
      const updated = prev.map((ev) => (ev.id === eventId ? { ...ev, completed: completedState } : ev));
      const pending = updated.filter((ev: any) => !ev.completed);
      setNextEvent(pending.length > 0 ? pending[0] : null);
      return updated;
    });

    try {
      const { error } = await supabase
        .from("academic_events")
        .update({ completed: completedState })
        .eq("id", eventId);

      if (error) {
        console.error("Erro ao atualizar entrega:", error.message);
        showToast("Não foi possível atualizar a entrega.");
        await fetchSupabaseData();
      } else {
        showToast(completedState ? "Entrega marcada como concluída! 🎉" : "Entrega reaberta como pendente.");
        await fetchSupabaseData();
      }
    } catch (err) {
      console.error("Erro ao alternar status da entrega:", err);
      showToast("Erro inesperado ao alterar status.");
      await fetchSupabaseData();
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    // 1. Atualização otimista imediata na interface
    setAllEvents((prev) => {
      const updated = prev.filter((ev) => ev.id !== eventId);
      const pending = updated.filter((ev: any) => !ev.completed);
      setNextEvent(pending.length > 0 ? pending[0] : null);
      return updated;
    });

    try {
      const { error } = await supabase.from("academic_events").delete().eq("id", eventId);
      if (error) {
        console.error("Erro ao excluir entrega:", error.message);
        showToast("Não foi possível excluir a entrega.");
        await fetchSupabaseData();
      } else {
        showToast("Entrega removida com sucesso.");
        await fetchSupabaseData();
      }
    } catch (err) {
      console.error("Erro inesperado ao excluir entrega:", err);
      showToast("Erro de comunicação ao excluir entrega.");
      await fetchSupabaseData();
    }
  };

  const selectAvatarForSubject = (subjectId: number, avatarStyle: string) => {
    setCourses((curr) =>
      curr.map((c) => (c.id === subjectId ? { ...c, avatar: avatarStyle } : c))
    );
    if (typeof window !== "undefined") {
      const currentSaved = JSON.parse(localStorage.getItem("unigag_subject_avatars") || "{}");
      currentSaved[subjectId] = avatarStyle;
      localStorage.setItem("unigag_subject_avatars", JSON.stringify(currentSaved));
    }
  };

  const displayedAttendance = useMemo(() => {
    if (attendanceFilter === "all") {
      const totalAbsences = courses.reduce((sum, c) => sum + (c.absences || 0), 0);
      const totalPresents = courses.reduce((sum, c) => sum + (c.presents || 0), 0);
      const registered = totalAbsences + totalPresents;
      if (registered === 0) return 100;
      return Math.max(0, Math.round((totalPresents / registered) * 100));
    }
    const single = courses.find((c) => c.id === attendanceFilter);
    if (!single) return 100;
    const reg = (single.absences || 0) + (single.presents || 0);
    if (reg === 0) return 100;
    return Math.max(0, Math.round(((single.presents || 0) / reg) * 100));
  }, [courses, attendanceFilter]);

  const atRiskCourses = useMemo(() => {
    return courses.filter((c) => {
      const limit = c.limit || 16;
      const absences = c.absences || 0;
      return limit - absences <= 3 || (limit > 0 && absences / limit >= 0.75);
    });
  }, [courses]);

  const mostCriticalCourse = useMemo(() => {
    if (courses.length === 0) return null;
    return [...courses].sort((a, b) => {
      const marginA = (a.limit || 16) - (a.absences || 0);
      const marginB = (b.limit || 16) - (b.absences || 0);
      return marginA - marginB;
    })[0];
  }, [courses]);

  const updateAttendance = async (id: number, kind: "present" | "absence" | "cancel") => {
    // 1. Atualização otimista imediata
    setCourses((current) =>
      current.map((course) => {
        if (course.id !== id) return course;
        if (kind === "present") return { ...course, presents: (course.presents || 0) + 1 };
        if (kind === "absence") return { ...course, absences: (course.absences || 0) + 1 };
        return course;
      })
    );

    showToast(
      kind === "present"
        ? "Presença registrada com sucesso."
        : kind === "absence"
          ? "Falta registrada e salva no banco."
          : "Aula cancelada."
    );

    try {
      const studentId = (user && student?.id) ? student.id : (currentStudent?.id || 1);
      const dbStatus = kind === "present" ? "present" : kind === "absence" ? "absence" : "cancelled";

      const { error } = await supabase.from("attendances").insert({
        student_id: studentId,
        subject_id: id,
        status: dbStatus,
        date: new Date().toISOString().split("T")[0],
      });

      if (error) {
        console.error("Erro ao gravar presença:", error);
        showToast("Erro ao sincronizar presença no banco.");
        await fetchSupabaseData();
      } else {
        await fetchSupabaseData();
      }
    } catch (err) {
      console.error("Erro ao conectar:", err);
      await fetchSupabaseData();
    }
  };

  return (
    <div className={`app theme-${theme} text-scale-${textScale}`}>
      <aside className={sidebarOpen ? "sidebar sidebar--open" : "sidebar"}>
        <div className="brand">
          <span className="brand__mark">
            <span /><span /><span />
          </span>
          <span className="brand__name">UniGag</span>
          <IconButton className="sidebar__close" label="Fechar menu" onClick={() => setSidebarOpen(false)}>
            <X size={19} />
          </IconButton>
        </div>

        <nav className="nav">
          <div className="nav__label">ORGANIZAÇÃO</div>
          <Button
            className={`nav__item ${activeView === "dashboard" ? "nav__item--active" : ""}`}
            onClick={() => setActiveView("dashboard")}
          >
            <LayoutDashboard size={19} /> Visão geral
          </Button>
          <Button className="nav__item" onClick={() => openModal("AVATARS", { courseId: avatarCourseId })}>
            <Sparkles size={19} /> Avatares
          </Button>
          <Button className="nav__item" onClick={() => openModal("COURSE")}>
            <BookOpen size={19} /> Disciplinas
            <span className="nav__count">{courses.length}</span>
          </Button>
          <Button className="nav__item" onClick={() => openModal("EVENT_LIST")}>
            <CalendarDays size={19} /> Entregas e Calendário
          </Button>
          <div className="nav__label nav__label--spaced">SUA CONTA</div>
          <Button className="nav__item" onClick={() => openModal("PROFILE")}>
            <UserRound size={19} /> Meu perfil
          </Button>
          <Button
            className="nav__item"
            onClick={handleSignOut}
            title="Encerrar sessão e voltar ao login"
          >
            <LogOut size={19} /> Sair da conta
          </Button>
        </nav>

        <div className="sidebar__tip">
          <span className="sidebar__tip-icon"><Sparkles size={18} /></span>
          <div>
            <strong>Dica do Uni</strong>
            <p>Selecione cada matéria no card para conferir sua média ponderada atual.</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button className="profile profile--button" onClick={() => openModal("PROFILE")} type="button" style={{ flex: 1 }}>
            <div className="avatar" role="img">{profileHealth}</div>
            <div className="profile__meta">
              <strong>{profileName}</strong>
              <span>{profileEducation}</span>
            </div>
            <MoreHorizontal size={18} />
          </button>
          <IconButton
            className="icon-button"
            label="Sair da conta"
            onClick={handleSignOut}
          >
            <LogOut size={17} />
          </IconButton>
        </div>
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
            <input placeholder="Buscar matéria, evento ou nota..." />
            <kbd>⌘ K</kbd>
          </label>
          <div className="topbar__actions">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "999px",
                fontSize: "0.78rem",
                fontWeight: 700,
                backgroundColor: "rgba(46, 204, 113, 0.12)",
                color: "#27ae60",
                border: "1px solid rgba(46, 204, 113, 0.25)",
              }}
              title={`Conectado como ${user?.email || "estudante verificado"}`}
            >
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#27ae60" }} />
              <span>Conectado</span>
            </div>
            <button
              className="accessibility-btn"
              onClick={toggleTextScale}
              title="Tamanho do texto"
              type="button"
            >
              <Type size={17} />
              <span>{textScale === "normal" ? "A" : textScale === "large" ? "A+" : "A++"}</span>
            </button>
            <button className="semester-select" type="button">
              <span>Semestre</span>
              <strong>{semester}</strong>
              <ChevronDown size={16} />
            </button>
            <div className="theme-picker">
              <IconButton
                className={themeMenuOpen ? "theme-trigger theme-trigger--active" : "theme-trigger"}
                label="Aparência"
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              >
                {theme === "dark" ? <Moon size={19} /> : <Sun size={19} />}
              </IconButton>
              {themeMenuOpen && (
                <div className="theme-menu">
                  <div className="theme-menu__title">Aparência</div>
                  {[
                    { id: "light", name: "Neutro", description: "Claro e minimalista" },
                    { id: "dark", name: "Gag Mode", description: "Grafite confortável" },
                    { id: "psa", name: "PSA", description: "Grafite e vinho" },
                    { id: "pride", name: "Pride", description: "Cores vivas do Orgulho" },
                  ].map((option) => (
                    <button
                      className={`theme-option ${theme === option.id ? "is-active" : ""}`}
                      key={option.id}
                      onClick={() => {
                        setTheme(option.id as any);
                        setThemeMenuOpen(false);
                      }}
                      type="button"
                    >
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
          <section className="welcome">
            <div>
              <div className="eyebrow">SEMESTRE ATUAL · UFG</div>
              <div className="page-title">Bom dia, {profileName.split(" ")[0]}!</div>
              <p>Faltas e notas em sintonia com seu ritmo acadêmico.</p>
            </div>
            <Button onClick={() => openModal("ATTENDANCE")} variant="primary">
              <Check size={18} /> Registrar aula de hoje
            </Button>
          </section>

          {mostCriticalCourse && (
            <button className="critical-alert" onClick={() => openModal("LIMITS")} type="button">
              <span className="critical-alert__icon"><AlertTriangle size={19} /></span>
              <span>
                <strong>Atenção com sua frequência em {mostCriticalCourse.name}</strong>
                <span>
                  Você possui {mostCriticalCourse.absences} faltas registradas de um limite de {mostCriticalCourse.limit} ({Math.max(0, mostCriticalCourse.limit - mostCriticalCourse.absences)} restantes).
                </span>
              </span>
              <span className="critical-alert__action">
                Ver detalhes <ChevronRight size={17} />
              </span>
            </button>
          )}

          {/* 4 CARDS NO TOPO */}
          <section className="stats-grid">
            <StatCard
              accent="blue"
              footer={
                <select
                  style={{
                    background: "transparent",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    color: "inherit",
                    cursor: "pointer",
                    outline: "none",
                  }}
                  value={attendanceFilter}
                  onChange={(e) => setAttendanceFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="all">Todas as matérias</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              }
              icon={<Check size={19} />}
              label="FREQUÊNCIA GERAL"
              onClick={() => openModal("LIMITS")}
            >
              <strong className="big-number">{displayedAttendance}%</strong>
              <span className="stat-copy">
                {displayedAttendance >= 85 ? "Excelente" : displayedAttendance >= 75 ? "Regular" : "Crítico"}
              </span>
            </StatCard>

            <StatCard
              accent="amber"
              footer={mostCriticalCourse ? `${mostCriticalCourse.name} requer atenção` : "Frequência segura"}
              icon={<AlertTriangle size={19} />}
              label="LIMITE DE FALTAS"
              onClick={() => openModal("LIMITS")}
            >
              <strong className="big-number">{atRiskCourses.length}</strong>
              <span className="stat-copy">
                {atRiskCourses.length === 1 ? "matéria em atenção" : "matérias em atenção"}
              </span>
            </StatCard>

            {/* CARD 3: SELEÇÃO DA MÉDIA DE CADA MATÉRIA OU MÉDIA GERAL */}
            <StatCard
              accent="lavender"
              footer={
                <select
                  style={{
                    background: "transparent",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    color: "inherit",
                    cursor: "pointer",
                    outline: "none",
                    maxWidth: "100%",
                    textOverflow: "ellipsis",
                  }}
                  value={gradeFilter}
                  onChange={(e) => {
                    const nextVal = e.target.value === "all" ? "all" : Number(e.target.value);
                    setGradeFilter(nextVal);
                    if (nextVal !== "all") {
                      setSelectedCalcCourseId(nextVal);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="all">📊 Média Geral do Semestre</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      📚 {c.name}
                    </option>
                  ))}
                </select>
              }
              icon={<TrendingUp size={19} />}
              label={
                gradeFilter === "all"
                  ? "MÉDIA DO SEMESTRE"
                  : `MÉDIA: ${courses.find((c) => c.id === gradeFilter)?.name.toUpperCase() || "MATÉRIA"}`
              }
              onClick={() =>
                openModal("CRITERIA", {
                  courseId: selectedCalcCourseId,
                  courseName: courses.find((c) => c.id === selectedCalcCourseId)?.name,
                })
              }
            >
              <strong className="big-number">{displayedCardGrade.mainScore}</strong>
              <span className="stat-copy">{displayedCardGrade.subtitle}</span>
            </StatCard>

            <StatCard
              accent="coral"
              onClick={() => openModal("EVENT_LIST")}
              footer={
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <span>{nextEvent ? `Até ${new Date(nextEvent.event_date).toLocaleDateString('pt-BR')}` : "Tudo em dia!"}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal("EVENT");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--coral, #f26a5a)",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.78rem",
                    }}
                  >
                    + Novo
                  </button>
                </div>
              }
              icon={<Clock3 size={19} />}
              label="PRÓXIMA ENTREGA"
            >
              {nextEvent ? (
                <div>
                  <strong className="big-number" style={{ fontSize: "1.25rem", display: "block" }}>
                    {nextEvent.title}
                  </strong>
                  <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleEventStatus(nextEvent.id, true);
                      }}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        background: "var(--mint, #2ecc71)",
                        color: "#fff",
                        border: "none",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Check size={12} /> Concluir
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <strong className="big-number" style={{ fontSize: "1.3rem" }}>Nenhuma</strong>
                  <span className="stat-copy">Sem entregas pendentes</span>
                </div>
              )}
            </StatCard>
          </section>

          <div className="dashboard-grid">
            <section className="panel attendance-panel">
              <div className="panel__header">
                <div>
                  <div className="panel__title">Frequência por matéria</div>
                  <p>Avatares animados que expressam a saúde da sua presença</p>
                </div>
                <div className="panel__actions">
                  <Button onClick={() => openModal("AVATARS", { courseId: avatarCourseId })} variant="ghost">
                    <Sparkles size={17} /> Avatares
                  </Button>
                  <Button onClick={() => openModal("COURSE")} variant="secondary">
                    <Plus size={17} /> Nova matéria
                  </Button>
                </div>
              </div>

              {loading ? (
                <p style={{ padding: "20px", color: "var(--text-muted)" }}>Sincronizando com o Supabase...</p>
              ) : (
                <div className="course-list">
                  {courses.map((course) => {
                    const limit = course.limit || 16;
                    const absences = course.absences || 0;
                    const presents = course.presents || 0;
                    const ratio = limit > 0 ? absences / limit : 0;
                    const status = ratio >= 0.75 ? "danger" : ratio >= 0.45 ? "warning" : "safe";
                    const statusText = status === "danger" ? "Em risco" : status === "warning" ? "Atenção" : "Seguro";

                    return (
                      <div className="course" key={course.id}>
                        <div className="course__main">
                          <button
                            type="button"
                            className="avatar-change-trigger"
                            onClick={() => {
                              setAvatarCourseId(course.id);
                              openModal("AVATARS", { courseId: course.id });
                            }}
                            title="Clique para trocar este personagem"
                          >
                            <AttendanceMood avatar={course.avatar || "diva"} ratio={ratio} />
                          </button>
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
                                <strong>{absences}</strong> de {limit} faltas
                                {presents > 0 && (
                                  <span style={{ color: "var(--mint)", marginLeft: "8px", fontWeight: "700" }}>
                                    · {presents} {presents === 1 ? "presença" : "presenças"}
                                  </span>
                                )}
                              </span>
                              <span className={`status status--${status}`}>{statusText}</span>
                            </span>
                            <span className="progress">
                              <span
                                className={`progress__bar progress__bar--${status}`}
                                style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                              />
                            </span>
                          </span>
                        </div>
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* PAINEL DA DIREITA: SIMULADOR E CRITÉRIOS */}
            <aside className="right-column">
              <section className="panel calculator">
                <div className="panel__header">
                  <div>
                    <div className="panel__title">Quanto preciso tirar?</div>
                    <p>Cálculo real por pesos e fórmulas</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      openModal("CRITERIA", {
                        courseId: selectedCalcCourseId,
                        courseName: courses.find((c) => c.id === selectedCalcCourseId)?.name,
                      })
                    }
                    title="Configurar fórmula e critérios"
                    style={{
                      background: "rgba(142, 68, 173, 0.12)",
                      border: "none",
                      color: "var(--lavender-strong, #8e44ad)",
                      padding: "6px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Settings2 size={18} />
                  </button>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <label className="select-label" style={{ flex: 1 }}>
                    Disciplina
                    <select
                      style={{
                        width: "100%",
                        height: "40px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        padding: "0 10px",
                        background: "var(--card-bg, #fff)",
                        fontSize: "0.88rem",
                        color: "inherit",
                        cursor: "pointer",
                        marginTop: "4px",
                      }}
                      value={selectedCalcCourseId || ""}
                      onChange={(e) => {
                        const nextId = Number(e.target.value);
                        setSelectedCalcCourseId(nextId);
                        setGradeFilter(nextId); // Sincroniza o Card 3 automaticamente
                      }}
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="select-label" style={{ width: "90px" }}>
                    Meta Final
                    <input
                      style={{
                        width: "100%",
                        height: "40px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        padding: "0 10px",
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "4px",
                      }}
                      placeholder="7,0"
                      value={targetGrade}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.,]/g, "");
                        const normalized = parseFloat(val.replace(",", "."));
                        if (val === "" || (!isNaN(normalized) && normalized >= 0 && normalized <= 10)) {
                          setTargetGrade(val);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Lista de Avaliações com Notas */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
                  {evaluations.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "var(--card-bg, #fbfbfb)",
                        border: "1px solid var(--border)",
                        fontSize: "0.85rem",
                      }}
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "6px" }}>
                          ({item.weight}%)
                        </span>
                      </div>
                      <input
                        style={{
                          width: "65px",
                          height: "32px",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: "0.88rem",
                        }}
                        placeholder="—"
                        value={item.score !== null ? String(item.score) : ""}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9.,]/g, "");
                          
                          if (raw === "") {
                            setEvaluations((curr) =>
                              curr.map((it, idx) => (idx === index ? { ...it, score: null } : it))
                            );
                            return;
                          }

                          const num = parseFloat(raw.replace(",", "."));
                          if (!isNaN(num) && num > 10) return;

                          setEvaluations((curr) =>
                            curr.map((it, idx) => (idx === index ? { ...it, score: raw } : it))
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Diagnóstico do Aluno */}
                <div className="result" style={{ marginTop: "14px" }}>
                  <span>
                    {gradeSummary.isApproved
                      ? "Meta já alcançada! 🎉"
                      : gradeSummary.pendingCount > 0
                        ? `Média necessária nas ${gradeSummary.pendingCount} avaliações restantes:`
                        : "Todas as notas foram lançadas"}
                  </span>
                  <strong style={{ color: gradeSummary.isFeasible ? "var(--text)" : "var(--coral)" }}>
                    {gradeSummary.isApproved ? "Aprovado" : gradeSummary.neededAverage}
                  </strong>
                  <span className="result__badge">
                    {gradeSummary.isApproved
                      ? "Aprovado na disciplina"
                      : gradeSummary.isFeasible
                        ? `Faltam ${gradeSummary.neededTotal} pontos no semestre`
                        : "Requer nota acima de 10 (Atenção para Prova Final)"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={handleSaveEvaluations}
                    disabled={isSavingEvaluations}
                    style={{
                      flex: 1,
                      height: "38px",
                      borderRadius: "8px",
                      border: "none",
                      background: "var(--lavender-strong, #8e44ad)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Save size={15} /> {isSavingEvaluations ? "Salvando..." : "Salvar Notas"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openModal("CRITERIA", {
                        courseId: selectedCalcCourseId,
                        courseName: courses.find((c) => c.id === selectedCalcCourseId)?.name,
                      })
                    }
                    style={{
                      height: "38px",
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "transparent",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    Editar Critérios
                  </button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {toast && (
        <div className="toast">
          <span><Check size={17} /></span>
          {toast}
        </div>
      )}

      {/* CENTRALIZED MODAL RENDERING */}
      <ModalCriteria
        isOpen={isOpen("CRITERIA")}
        onClose={closeModal}
        courseId={(modalPayload as CriteriaModalPayload)?.courseId ?? selectedCalcCourseId}
        courseName={(modalPayload as CriteriaModalPayload)?.courseName ?? courses.find((c) => c.id === selectedCalcCourseId)?.name}
        initialEvaluations={evaluations}
        onSuccess={(msg) => {
          showToast(msg || "Critérios salvos com sucesso!");
          fetchSupabaseData();
          if (selectedCalcCourseId) fetchSubjectEvaluations(selectedCalcCourseId);
        }}
      />

      <ModalEventList
        isOpen={isOpen("EVENT_LIST")}
        onClose={closeModal}
        onNewEvent={() => openModal("EVENT")}
        allEvents={allEvents}
        courses={courses}
        onToggleEventStatus={handleToggleEventStatus}
        onDeleteEvent={handleDeleteEvent}
      />

      <ModalLimits
        isOpen={isOpen("LIMITS")}
        onClose={closeModal}
        courses={courses}
      />

      <ModalEvent
        isOpen={isOpen("EVENT")}
        onClose={closeModal}
        courses={courses}
        defaultSubjectId={(modalPayload as EventModalPayload)?.subjectId}
        studentId={(user && student?.id) ? student.id : (currentStudent?.id || 1)}
        onSuccess={(msg) => {
          showToast(msg || "Entrega adicionada com sucesso!");
          fetchSupabaseData();
        }}
      />

      <ModalCourse
        isOpen={isOpen("COURSE")}
        onClose={closeModal}
        currentCourseCount={courses.length}
        studentId={(user && student?.id) ? student.id : (currentStudent?.id || 1)}
        onSuccess={(msg) => {
          showToast(msg || "Disciplina criada com sucesso!");
          fetchSupabaseData();
        }}
      />

      <ModalAvatars
        isOpen={isOpen("AVATARS")}
        onClose={closeModal}
        courses={courses}
        initialCourseId={(modalPayload as AvatarsModalPayload)?.courseId ?? avatarCourseId}
        onUpdateAvatar={selectAvatarForSubject}
        onSuccess={(msg) => {
          showToast(msg || "Avatares acadêmicos atualizados!");
        }}
      />

      <ModalAttendance
        isOpen={isOpen("ATTENDANCE")}
        onClose={closeModal}
        courses={courses}
        studentId={(user && student?.id) ? student.id : (currentStudent?.id || 1)}
        onSuccess={(msg, data) => {
          showToast(msg || "Presença registrada com sucesso!");
          if (data) {
            setCourses((curr) =>
              curr.map((c) => {
                if (c.id === data.courseId) {
                  return {
                    ...c,
                    presents: data.status === "present" ? (c.presents || 0) + 1 : c.presents,
                    absences: data.status === "absence" ? (c.absences || 0) + 1 : c.absences,
                  };
                }
                return c;
              })
            );
          }
          fetchSupabaseData();
        }}
      />

      <ModalProfile
        isOpen={isOpen("PROFILE")}
        onClose={closeModal}
        initialHealth={profileHealth}
        initialName={profileName}
        initialEducation={profileEducation}
        initialPhone={customProfilePhone}
        onUpdateProfile={async ({ name, education, health, phone }) => {
          setProfileHealth(health);
          setCustomProfileName(name);
          setCustomProfileEducation(education);
          if (phone !== undefined) setCustomProfilePhone(phone);

          if (student?.id) {
            try {
              await supabase
                .from("students")
                .update({ name, phone: phone || null })
                .eq("id", student.id);
              await refreshStudent();
            } catch (err) {
              console.warn("⚠️ Aviso ao sincronizar perfil com o Supabase:", err);
            }
          }
        }}
        onSuccess={(msg) => {
          showToast(msg || "Perfil acadêmico atualizado!");
        }}
      />

      <ModalAuth
        isOpen={isOpen("AUTH")}
        onClose={closeModal}
        onSuccess={(msg) => {
          showToast(msg || "Autenticado com sucesso!");
          fetchSupabaseData();
        }}
      />
    </div>
  );
}

export default function App({
  squadProfiles = [],
  currentStudent,
}: {
  squadProfiles?: SquadProfile[];
  currentStudent?: CurrentStudent;
  dbCourses?: any[];
  dbNextEvent?: any;
}) {
  return (
    <AuthProvider>
      <Dashboard
        currentStudent={currentStudent}
        squadProfiles={squadProfiles}
      />
    </AuthProvider>
  );
}