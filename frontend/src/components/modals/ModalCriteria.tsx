"use client";

import { useState, useEffect } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Modal } from "./Modal";
import { supabase } from "@/lib/supabaseClient";
import type { EvaluationItem } from "@/app/(frontend)/UniGagApp";
import type { ModalBaseProps } from "@/types/modals";

const evaluationItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome da avaliação é obrigatório.")
    .max(60, "O nome não pode exceder 60 caracteres.")
    .regex(/^[^<>%$]*$/, "Caracteres inválidos detectados."),
  category: z.enum(["exam", "assignment", "list", "project", "presentation", "article"]),
  weight: z
    .number({ message: "Peso deve ser numérico." })
    .min(0, "O peso não pode ser negativo.")
    .max(100, "O peso não pode exceder 100%."),
  score: z
    .number({ message: "Nota deve ser numérica." })
    .min(0, "A nota não pode ser menor que 0,0.")
    .max(10, "A nota máxima permitida é 10,0.")
    .nullable(),
});

const criteriaBatchSchema = z.object({
  subject_id: z.number().int().positive("Disciplina inválida."),
  evaluations: z.array(evaluationItemSchema).min(1, "Insira ao menos um critério ou avaliação."),
});

interface ModalCriteriaProps extends ModalBaseProps {
  courseId: number | null;
  courseName?: string;
  initialEvaluations?: EvaluationItem[];
}

export function ModalCriteria({
  isOpen,
  onClose,
  onSuccess,
  courseId,
  courseName,
  initialEvaluations = [],
}: ModalCriteriaProps) {
  const [items, setItems] = useState<EvaluationItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialEvaluations && initialEvaluations.length > 0) {
        setItems([...initialEvaluations]);
      } else {
        setItems([
          { subject_id: courseId || 1, name: "P1", category: "exam", weight: "20", score: null },
          { subject_id: courseId || 1, name: "P2", category: "exam", weight: "30", score: null },
          { subject_id: courseId || 1, name: "P3", category: "exam", weight: "40", score: null },
          { subject_id: courseId || 1, name: "Listas de Exercícios", category: "list", weight: "10", score: null },
        ]);
      }
      setErrors({});
    }
  }, [isOpen, initialEvaluations, courseId]);

  if (!isOpen) return null;

  const totalWeight = items.reduce((sum, it) => {
    const w = parseFloat(String(it.weight).replace(",", ".")) || 0;
    return sum + w;
  }, 0);

  const applyPreset = (presetType: "weighted" | "simple" | "theory_practice") => {
    const sId = courseId || 1;
    if (presetType === "weighted") {
      setItems([
        { subject_id: sId, name: "P1", category: "exam", weight: "20", score: null },
        { subject_id: sId, name: "P2", category: "exam", weight: "30", score: null },
        { subject_id: sId, name: "P3", category: "exam", weight: "40", score: null },
        { subject_id: sId, name: "Listas / Atividades", category: "list", weight: "10", score: null },
      ]);
    } else if (presetType === "simple") {
      setItems([
        { subject_id: sId, name: "P1", category: "exam", weight: "33,3", score: null },
        { subject_id: sId, name: "P2", category: "exam", weight: "33,3", score: null },
        { subject_id: sId, name: "P3", category: "exam", weight: "33,4", score: null },
      ]);
    } else if (presetType === "theory_practice") {
      setItems([
        { subject_id: sId, name: "Provas Teóricas", category: "exam", weight: "60", score: null },
        { subject_id: sId, name: "Projeto / Seminário", category: "project", weight: "40", score: null },
      ]);
    }
    setErrors({});
  };

  const handleSave = async () => {
    if (isSubmitting || !courseId) return;

    setErrors({});

    // Converter para números antes da validação Zod
    const parsedItems = items.map((it) => {
      const numWeight = parseFloat(String(it.weight).replace(",", "."));
      const numScore =
        it.score !== null && it.score !== undefined && String(it.score).trim() !== ""
          ? parseFloat(String(it.score).replace(",", "."))
          : null;

      return {
        name: it.name,
        category: it.category,
        weight: isNaN(numWeight) ? -1 : numWeight,
        score: numScore !== null && !isNaN(numScore) ? numScore : null,
      };
    });

    const validation = criteriaBatchSchema.safeParse({
      subject_id: courseId,
      evaluations: parsedItems,
    });

    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      setErrors({ form: firstIssue?.message || "Dados dos critérios de avaliação inválidos." });
      return;
    }

    setIsSubmitting(true);
    try {
      // Deleta itens anteriores da disciplina e insere a lista validada
      const { error: delError } = await supabase
        .from("subject_evaluations")
        .delete()
        .eq("subject_id", courseId);

      if (delError) {
        console.error("Erro ao limpar critérios antigos:", delError.message);
        setErrors({ form: "Falha ao atualizar critérios no Supabase." });
        return;
      }

      const payload = validation.data.evaluations.map((ev) => ({
        subject_id: courseId,
        name: ev.name,
        category: ev.category,
        weight: ev.weight,
        score: ev.score,
      }));

      const { error: insError } = await supabase
        .from("subject_evaluations")
        .insert(payload);

      if (insError) {
        console.error("Erro ao inserir critérios:", insError.message);
        setErrors({ form: "Não foi possível gravar as avaliações no Supabase." });
        return;
      }

      onSuccess?.("Critérios e avaliações sincronizados com o banco!");
      onClose();
    } catch (err) {
      console.error("Erro inesperado ao salvar critérios:", err);
      setErrors({ form: "Erro de comunicação ao salvar critérios." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title={`Critérios de Avaliação${courseName ? ` — ${courseName}` : ""}`} wide>
      <p className="modal__intro">
        Escolha um modelo base ou ajuste os pesos e avaliações da matéria:
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

      <div style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "8px" }}>
          Modelos Pré-definidos:
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          <button
            disabled={isSubmitting}
            onClick={() => applyPreset("weighted")}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--card-bg, #fff)",
              textAlign: "left",
              cursor: "pointer",
            }}
            type="button"
          >
            <strong style={{ fontSize: "0.88rem", display: "block" }}>Média Ponderada Livre</strong>
            <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
              Pesos crescentes (20%, 30%, 40% + 10% de Listas/Atividades)
            </small>
          </button>

          <button
            disabled={isSubmitting}
            onClick={() => applyPreset("simple")}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--card-bg, #fff)",
              textAlign: "left",
              cursor: "pointer",
            }}
            type="button"
          >
            <strong style={{ fontSize: "0.88rem", display: "block" }}>Média Simples (Aritmética)</strong>
            <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
              Pesos iguais (divisão de ~33,3% por prova)
            </small>
          </button>

          <button
            disabled={isSubmitting}
            onClick={() => applyPreset("theory_practice")}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--card-bg, #fff)",
              textAlign: "left",
              cursor: "pointer",
            }}
            type="button"
          >
            <strong style={{ fontSize: "0.88rem", display: "block" }}>Teoria & Prática</strong>
            <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
              Divisão entre Provas Teóricas (60%) e Projetos/Prática (40%)
            </small>
          </button>
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Distribuição de Avaliações:</span>
          <button
            className="button button--ghost"
            disabled={isSubmitting}
            onClick={() => {
              setItems((curr) => [
                ...curr,
                {
                  subject_id: courseId || 1,
                  name: `Avaliação ${curr.length + 1}`,
                  category: "assignment",
                  weight: "10",
                  score: null,
                },
              ]);
            }}
            type="button"
          >
            <Plus size={14} /> Adicionar Item
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {items.map((ev, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 90px 40px",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <input
                disabled={isSubmitting}
                maxLength={60}
                onChange={(e) => {
                  const name = e.target.value;
                  setItems((curr) => curr.map((it, idx) => (idx === index ? { ...it, name } : it)));
                }}
                style={{
                  height: "38px",
                  padding: "0 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  fontSize: "0.85rem",
                }}
                value={ev.name}
              />

              <select
                disabled={isSubmitting}
                onChange={(e) => {
                  const category = e.target.value as EvaluationItem["category"];
                  setItems((curr) => curr.map((it, idx) => (idx === index ? { ...it, category } : it)));
                }}
                style={{
                  height: "38px",
                  padding: "0 8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  fontSize: "0.82rem",
                }}
                value={ev.category}
              >
                <option value="exam">Prova</option>
                <option value="list">Lista de Exercícios</option>
                <option value="project">Projeto Prático</option>
                <option value="presentation">Apresentação</option>
                <option value="article">Artigo / Ensaio</option>
                <option value="assignment">Trabalho Geral</option>
              </select>

              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <input
                  disabled={isSubmitting}
                  inputMode="decimal"
                  maxLength={5}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9.,]/g, "");
                    if (raw === "") {
                      setItems((curr) =>
                        curr.map((it, idx) => (idx === index ? { ...it, weight: "" } : it))
                      );
                      return;
                    }
                    const num = parseFloat(raw.replace(",", "."));
                    if (!isNaN(num) && num > 100) return;

                    setItems((curr) =>
                      curr.map((it, idx) => (idx === index ? { ...it, weight: raw } : it))
                    );
                  }}
                  placeholder="0"
                  style={{
                    width: "55px",
                    height: "38px",
                    textAlign: "center",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                  type="text"
                  value={ev.weight === "" ? "" : String(ev.weight)}
                />
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>%</span>
              </div>

              <button
                aria-label="Remover item"
                className="icon-button"
                disabled={isSubmitting || items.length <= 1}
                onClick={() => {
                  setItems((curr) => curr.filter((_, idx) => idx !== index));
                }}
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            borderRadius: "6px",
            background: Math.abs(totalWeight - 100) < 0.2 ? "rgba(46, 204, 113, 0.1)" : "rgba(235, 87, 87, 0.1)",
            color: Math.abs(totalWeight - 100) < 0.2 ? "var(--mint, #2ecc71)" : "var(--coral, #f26a5a)",
            fontSize: "0.82rem",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Soma dos Pesos:</span>
          <span>
            {totalWeight.toFixed(1)}%{" "}
            {Math.abs(totalWeight - 100) < 0.2 ? "✓ (Correto: 100%)" : "(Atenção: a soma ideal é 100%)"}
          </span>
        </div>
      </div>

      <div className="modal__actions" style={{ marginTop: "20px" }}>
        <button
          className="button button--ghost"
          disabled={isSubmitting}
          onClick={onClose}
          type="button"
        >
          Cancelar
        </button>
        <button
          className="button button--primary"
          disabled={isSubmitting}
          onClick={handleSave}
          type="button"
        >
          <Check size={16} /> {isSubmitting ? "Gravando no Banco..." : "Salvar Critérios na Matéria"}
        </button>
      </div>
    </Modal>
  );
}
