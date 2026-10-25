"use client";

import { useState } from "react";
import { Check, XCircle } from "lucide-react";
import { z } from "zod";
import { Modal } from "./Modal";
import { supabase } from "@/lib/supabaseClient";
import type { ModalBaseProps } from "@/types/modals";

const attendanceRecordSchema = z.object({
  subject_id: z.number().int().positive("Disciplina inválida."),
  status: z.enum(["present", "absence", "cancelled", "justified"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),
});

interface ModalAttendanceProps extends ModalBaseProps {
  courses: Array<{ id: number; name: string }>;
  studentId?: string | number;
  onSuccess?: (message?: string, data?: { courseId: number; status: "present" | "absence" }) => void;
}

export function ModalAttendance({
  isOpen,
  onClose,
  onSuccess,
  courses,
  studentId = 1,
}: ModalAttendanceProps) {
  const [submittingCourseId, setSubmittingCourseId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegisterAttendance = async (
    courseId: number,
    courseName: string,
    status: "present" | "absence" = "present"
  ) => {
    if (submittingCourseId !== null) return; // Bloqueio contra múltiplos cliques concorrentes

    setErrorMsg(null);
    const today = new Date().toISOString().split("T")[0];

    const validation = attendanceRecordSchema.safeParse({
      subject_id: courseId,
      status,
      date: today,
    });

    if (!validation.success) {
      setErrorMsg("Parâmetros de presença inválidos.");
      return;
    }

    setSubmittingCourseId(courseId);
    try {
      const { error } = await supabase.from("attendances").insert({
        student_id: studentId,
        subject_id: courseId,
        status,
        date: today,
      });

      if (error) {
        console.error("Falha ao registrar presença:", error.message);
        setErrorMsg("Não foi possível salvar o registro de presença no Supabase.");
        return;
      }

      onSuccess?.(
        status === "present"
          ? `Presença confirmada em ${courseName}!`
          : `Falta registrada em ${courseName}.`,
        { courseId, status }
      );
      onClose();
    } catch (err) {
      console.error("Erro inesperado ao registrar chamada:", err);
      setErrorMsg("Erro de comunicação ao registrar presença.");
    } finally {
      setSubmittingCourseId(null);
    }
  };

  return (
    <Modal onClose={onClose} title="Registrar Aula de Hoje">
      <p className="modal__intro">
        Selecione uma disciplina para registrar sua frequência imediatamente:
      </p>

      {errorMsg && (
        <div
          role="alert"
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            backgroundColor: "rgba(235, 87, 87, 0.12)",
            color: "var(--coral, #eb5757)",
            fontSize: "0.85rem",
            marginBottom: "16px",
            fontWeight: 600,
          }}
        >
          {errorMsg}
        </div>
      )}

      {courses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
          Nenhuma matéria cadastrada no semestre.
        </div>
      ) : (
        <div className="modal__actions modal__actions--stack">
          {courses.map((c) => {
            const isPending = submittingCourseId === c.id;
            return (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <button
                  className="button button--primary"
                  disabled={submittingCourseId !== null}
                  onClick={() => handleRegisterAttendance(c.id, c.name, "present")}
                  style={{ flex: 1, justifyContent: "flex-start" }}
                  type="button"
                >
                  <Check size={18} />
                  {isPending ? "Registrando..." : `Estive presente em ${c.name}`}
                </button>
                <button
                  className="button button--ghost"
                  disabled={submittingCourseId !== null}
                  onClick={() => handleRegisterAttendance(c.id, c.name, "absence")}
                  style={{
                    color: "var(--coral, #f26a5a)",
                    borderColor: "var(--border)",
                    padding: "0 14px",
                  }}
                  title="Registrar falta"
                  type="button"
                >
                  <XCircle size={18} /> Faltei
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="modal__actions" style={{ marginTop: "20px" }}>
        <button
          className="button button--ghost"
          disabled={submittingCourseId !== null}
          onClick={onClose}
          type="button"
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
}
