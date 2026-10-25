"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { z } from "zod";
import { Modal } from "./Modal";
import { courseAvatarStyles } from "@/app/(frontend)/UniGagApp";
import { supabase } from "@/lib/supabaseClient";
import type { ModalBaseProps } from "@/types/modals";

const courseSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "O nome da matéria deve conter pelo menos 2 caracteres.")
      .max(80, "O nome da matéria não pode ultrapassar 80 caracteres.")
      .regex(/^[^<>%$]*$/, "O nome contém caracteres proibidos."),
    code: z
      .string()
      .trim()
      .max(20, "O código não pode ultrapassar 20 caracteres.")
      .regex(/^[A-Za-z0-9-_ ]*$/, "Código deve conter apenas letras, números ou traços.")
      .optional()
      .or(z.literal("")),
    avatar: z.string().min(1, "Selecione um personagem inicial."),
    total_classes: z
      .number({ message: "Total de aulas deve ser um número." })
      .int("O total de aulas deve ser um número inteiro.")
      .min(4, "O mínimo é de 4 aulas no semestre.")
      .max(400, "O total de aulas não pode exceder 400."),
    max_absences: z
      .number({ message: "Limite de faltas deve ser um número." })
      .int("O limite de faltas deve ser um número inteiro.")
      .min(1, "O limite de faltas deve ser de no mínimo 1.")
      .max(200, "Limite de faltas inválido."),
  })
  .refine((data) => data.max_absences <= data.total_classes, {
    message: "O limite de faltas não pode ser superior ao total de aulas da disciplina.",
    path: ["max_absences"],
  });

interface ModalCourseProps extends ModalBaseProps {
  currentCourseCount?: number;
  studentId?: number | string;
}

export function ModalCourse({
  isOpen,
  onClose,
  onSuccess,
  currentCourseCount = 0,
  studentId,
}: ModalCourseProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [avatar, setAvatar] = useState("diva");
  const [totalClasses, setTotalClasses] = useState(64);
  const [maxAbsences, setMaxAbsences] = useState(16);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClassesChange = (val: number) => {
    setTotalClasses(val);
    setMaxAbsences(Math.max(1, Math.round(val * 0.25)));
  };

  const resetForm = () => {
    setName("");
    setCode("");
    setAvatar("diva");
    setTotalClasses(64);
    setMaxAbsences(16);
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

    const result = courseSchema.safeParse({
      name,
      code,
      avatar,
      total_classes: totalClasses,
      max_absences: maxAbsences,
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
      const generatedCode = validData.code && validData.code.trim().length > 0
        ? validData.code.trim().toUpperCase()
        : `INF0${currentCourseCount + 1}`;

      const { data, error } = await supabase
        .from("subjects")
        .insert({
          student_id: studentId || 1,
          name: validData.name,
          code: generatedCode,
          total_classes: validData.total_classes,
          max_absences: validData.max_absences,
        })
        .select();

      if (error) {
        console.error("Falha ao salvar disciplina:", error.message);
        setErrors({ form: "Não foi possível cadastrar a matéria. Verifique os dados ou permissões." });
        return;
      }

      if (data && data[0]?.id && typeof window !== "undefined") {
        try {
          const currentSaved = JSON.parse(localStorage.getItem("unigag_subject_avatars") || "{}");
          currentSaved[data[0].id] = validData.avatar;
          localStorage.setItem("unigag_subject_avatars", JSON.stringify(currentSaved));
        } catch {
          // Ignora falha de armazenamento local do avatar
        }
      }

      resetForm();
      onSuccess?.("Nova disciplina cadastrada com sucesso!");
      onClose();
    } catch (err) {
      console.error("Erro inesperado ao salvar matéria:", err);
      setErrors({ form: "Ocorreu um erro inesperado ao salvar a matéria." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={handleClose} title="Cadastrar Nova Matéria">
      <form onSubmit={handleSubmit} noValidate>
        <p className="modal__intro">
          Adicione uma nova disciplina à sua grade. Os dados serão validados e sincronizados com o Supabase.
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
            Nome da Matéria *
            <input
              className={`field ${errors.name ? "is-invalid" : ""}`}
              disabled={isSubmitting}
              maxLength={80}
              placeholder="Ex.: Inteligência Artificial"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
            />
            {errors.name && (
              <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem", marginTop: "4px" }}>
                {errors.name}
              </span>
            )}
          </label>

          <label>
            Código da Matéria
            <input
              className={`field ${errors.code ? "is-invalid" : ""}`}
              disabled={isSubmitting}
              maxLength={20}
              placeholder="Ex.: INF0320"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (errors.code) setErrors((prev) => ({ ...prev, code: "" }));
              }}
            />
            {errors.code && (
              <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem", marginTop: "4px" }}>
                {errors.code}
              </span>
            )}
          </label>

          <label>
            Personagem Inicial
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
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            >
              {courseAvatarStyles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Total de Aulas *
            <input
              className={`field ${errors.total_classes ? "is-invalid" : ""}`}
              disabled={isSubmitting}
              min={4}
              max={400}
              type="number"
              value={String(totalClasses)}
              onChange={(e) => handleClassesChange(Number(e.target.value) || 0)}
            />
            {errors.total_classes && (
              <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem", marginTop: "4px" }}>
                {errors.total_classes}
              </span>
            )}
          </label>

          <label>
            Limite de Faltas (Padrão 25%) *
            <input
              className={`field ${errors.max_absences ? "is-invalid" : ""}`}
              disabled={isSubmitting}
              min={1}
              max={200}
              type="number"
              value={String(maxAbsences)}
              onChange={(e) => {
                setMaxAbsences(Number(e.target.value) || 0);
                if (errors.max_absences) setErrors((prev) => ({ ...prev, max_absences: "" }));
              }}
            />
            {errors.max_absences && (
              <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem", marginTop: "4px" }}>
                {errors.max_absences}
              </span>
            )}
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
            <Plus size={17} /> {isSubmitting ? "Cadastrando..." : "Adicionar Matéria"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
