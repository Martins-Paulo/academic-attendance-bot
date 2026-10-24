"use client";

import type { Dispatch, SetStateAction } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import type { EvaluationItem } from "@/app/(frontend)/UniGagApp";

interface ModalCriteriaProps {
  onClose: () => void;
  evaluations: EvaluationItem[];
  setEvaluations: Dispatch<SetStateAction<EvaluationItem[]>>;
  selectedCalcCourseId: number | null;
  applyPreset: (presetType: "weighted" | "simple" | "theory_practice") => void;
  totalWeight: number;
  onSave: () => void;
}

export function ModalCriteria({
  onClose,
  evaluations,
  setEvaluations,
  selectedCalcCourseId,
  applyPreset,
  totalWeight,
  onSave,
}: ModalCriteriaProps) {
  return (
    <Modal onClose={onClose} title="Configurador de Critérios de Avaliação" wide>
      <p className="modal__intro">
        Escolha um modelo base ou ajuste os pesos e avaliações da matéria:
      </p>

      <div style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "8px" }}>
          Modelos Base:
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          <button
            type="button"
            onClick={() => applyPreset("weighted")}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--card-bg, #fff)",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <strong style={{ fontSize: "0.88rem", display: "block" }}>Média Ponderada Livre</strong>
            <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
              Provas com pesos crescentes + Listas/Participação (ex: 20%, 30%, 40% + 10%)
            </small>
          </button>

          <button
            type="button"
            onClick={() => applyPreset("simple")}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--card-bg, #fff)",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <strong style={{ fontSize: "0.88rem", display: "block" }}>Média Simples (Aritmética)</strong>
            <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
              Provas com o mesmo peso (divisão igualitária de 33,3% por prova)
            </small>
          </button>

          <button
            type="button"
            onClick={() => applyPreset("theory_practice")}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--card-bg, #fff)",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <strong style={{ fontSize: "0.88rem", display: "block" }}>Teoria & Prática</strong>
            <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
              Divisão entre Provas Teóricas (60%) e Projetos/Laboratório (40%)
            </small>
          </button>
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Distribuição de Avaliações:</span>
          <button
            className="button button--ghost"
            type="button"
            onClick={() => {
              setEvaluations((curr) => [
                ...curr,
                {
                  subject_id: selectedCalcCourseId || 1,
                  name: `Avaliação ${curr.length + 1}`,
                  category: "assignment",
                  weight: "10",
                  score: null,
                },
              ]);
            }}
          >
            <Plus size={14} /> Adicionar Item
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {evaluations.map((ev, index) => (
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
                style={{
                  height: "38px",
                  padding: "0 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  fontSize: "0.85rem",
                }}
                value={ev.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setEvaluations((curr) => curr.map((it, idx) => (idx === index ? { ...it, name } : it)));
                }}
              />

              <select
                style={{
                  height: "38px",
                  padding: "0 8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  fontSize: "0.82rem",
                }}
                value={ev.category}
                onChange={(e) => {
                  const category = e.target.value as EvaluationItem["category"];
                  setEvaluations((curr) => curr.map((it, idx) => (idx === index ? { ...it, category } : it)));
                }}
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
                  type="text"
                  inputMode="decimal"
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
                  value={ev.weight === "" ? "" : String(ev.weight)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9.,]/g, "");
                    if (raw === "") {
                      setEvaluations((curr) =>
                        curr.map((it, idx) => (idx === index ? { ...it, weight: "" } : it))
                      );
                      return;
                    }

                    const num = parseFloat(raw.replace(",", "."));
                    if (!isNaN(num) && num > 100) return;

                    setEvaluations((curr) =>
                      curr.map((it, idx) => (idx === index ? { ...it, weight: raw } : it))
                    );
                  }}
                />
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>%</span>
              </div>

              <button
                aria-label="Remover item"
                className="icon-button"
                type="button"
                onClick={() => {
                  setEvaluations((curr) => curr.filter((_, idx) => idx !== index));
                }}
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
            {Math.abs(totalWeight - 100) < 0.2 ? "✓ (Correto: 100%)" : "(Atenção: deve somar 100%)"}
          </span>
        </div>
      </div>

      <div className="modal__actions" style={{ marginTop: "20px" }}>
        <button className="button button--ghost" onClick={onClose} type="button">
          Cancelar
        </button>
        <button className="button button--primary" onClick={onSave} type="button">
          <Check size={16} /> Salvar Critérios na Matéria
        </button>
      </div>
    </Modal>
  );
}
