"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { z } from "zod";
import { Modal } from "./Modal";
import { supabase } from "@/lib/supabaseClient";
import type { ModalBaseProps } from "@/types/modals";

const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "O título deve ter no mínimo 3 caracteres.")
    .max(120, "O título deve ter no máximo 120 caracteres.")
    .regex(/^[^<>%$]*$/, "O título contém caracteres inválidos."),
  type: z.enum(["Trabalho", "Prova", "Projeto", "Seminário", "Lista"] as const, {
    message: "Selecione uma categoria válida.",
  }),
  event_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida."),
  subject_id: z.number().int().positive().nullable(),
});

interface ModalEventProps extends ModalBaseProps {
  courses: Array<{ id: number; name: string }>;
  defaultSubjectId?: number | null;
  studentId?: number | string;
}

export function ModalEvent({
  isOpen,
  onClose,
  onSuccess,
  courses,
  defaultSubjectId,
  studentId,
}: ModalEventProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"Trabalho" | "Prova" | "Projeto" | "Seminário" | "Lista">("Trabalho");
  const [eventDate, setEventDate] = useState("");
  const [subjectId, setSubjectId] = useState<number | "">(defaultSubjectId || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle("");
    setType("Trabalho");
    setEventDate("");
    setSubjectId(defaultSubjectId || "");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setErrors({});

    const parsedSubjectId = subjectId === "" ? null : Number(subjectId);

    const result = eventSchema.safeParse({
      title,
      type,
      event_date: eventDate,
      subject_id: parsedSubjectId,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = String(issue.path[0]);
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const validData = result.data;
      const { error } = await supabase.from("academic_events").insert({
        student_id: studentId || 1,
        title: validData.title,
        type: validData.type,
        event_date: validData.event_date,
        subject_id: validData.subject_id,
        completed: false,
      });

      if (error) {
        console.error("Falha ao cadastrar entrega no Supabase:", error.message);
        setErrors({ form: "Não foi possível cadastrar a entrega. Tente novamente." });
        return;
      }

      resetForm();
      onSuccess?.("Nova entrega cadastrada com sucesso!");
      onClose();
    } catch (err) {
      console.error("Erro inesperado ao salvar evento:", err);
      setErrors({ form: "Ocorreu um erro inesperado ao salvar a entrega." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={handleClose} title="Adicionar Nova Entrega ou Avaliação">
      <form onSubmit={handleSubmit} noValidate>
        <p className="modal__intro">
          Cadastre trabalhos, projetos, seminários ou provas com data limite.
        </p>

        {errors.form && (
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
            {errors.form}
          </div>
        )}

        <div className="form-grid">
          <label className="form-grid__wide">
            Título do Trabalho ou Prova *
            <input
              className={`field ${errors.title ? "is-invalid" : ""}`}
              disabled={isSubmitting}
              maxLength={120}
              placeholder="Ex.: Projeto Prático de Banco de Dados"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
              }}
            />
            {errors.title && (
              <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem", marginTop: "4px" }}>
                {errors.title}
              </span>
            )}
          </label>

          <label>
            Tipo de Avaliação *
            <select
              disabled={isSubmitting}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                padding: "0 12px",
                background: "var(--card-bg, #fff)",
                fontSize: "0.92rem",
                color: "inherit",
              }}
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="Trabalho">Trabalho</option>
              <option value="Prova">Prova</option>
              <option value="Projeto">Projeto</option>
              <option value="Seminário">Seminário</option>
              <option value="Lista">Lista de Exercícios</option>
            </select>
          </label>

          <label>
            Data da Entrega *
            <input
              className={`field ${errors.event_date ? "is-invalid" : ""}`}
              disabled={isSubmitting}
              type="date"
              value={eventDate}
              onChange={(e) => {
                setEventDate(e.target.value);
                if (errors.event_date) setErrors((prev) => ({ ...prev, event_date: "" }));
              }}
            />
            {errors.event_date && (
              <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem", marginTop: "4px" }}>
                {errors.event_date}
              </span>
            )}
          </label>

          <label className="form-grid__wide">
            Disciplina Associada
            <select
              disabled={isSubmitting}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                padding: "0 12px",
                background: "var(--card-bg, #fff)",
                fontSize: "0.92rem",
                color: "inherit",
              }}
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Geral / Sem matéria específica</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="modal__actions" style={{ marginTop: "24px" }}>
          <button
            className="button button--ghost"
            disabled={isSubmitting}
            onClick={handleClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="button button--primary"
            disabled={isSubmitting}
            type="submit"
          >
            <Plus size={17} /> {isSubmitting ? "Salvando..." : "Salvar Entrega"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
