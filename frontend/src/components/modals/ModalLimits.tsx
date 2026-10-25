"use client";

import { Modal } from "./Modal";
import type { ModalBaseProps } from "@/types/modals";

interface ModalLimitsProps extends ModalBaseProps {
  courses: Array<{
    id: number;
    name: string;
    limit?: number;
    absences?: number;
  }>;
}

export function ModalLimits({ isOpen, onClose, courses }: ModalLimitsProps) {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title="Diagnóstico de Faltas">
      <p className="modal__intro">
        Acompanhe o saldo restante de faltas em cada disciplina antes de reprovar por frequência:
      </p>

      {courses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
          Nenhuma matéria cadastrada no semestre.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
          {courses.map((c) => {
            const limit = c.limit || 16;
            const absences = c.absences || 0;
            const remaining = Math.max(0, limit - absences);
            const isCrit = remaining <= 2;
            return (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: isCrit ? "rgba(235, 87, 87, 0.08)" : "var(--card-bg, #f9f9f9)",
                  border: `1px solid ${isCrit ? "var(--coral, #f26a5a)" : "var(--border)"}`,
                }}
              >
                <div>
                  <strong>{c.name}</strong>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {absences} faltas usadas de {limit} permitidas
                  </div>
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    color: isCrit ? "var(--coral, #f26a5a)" : "var(--mint, #2ecc71)",
                  }}
                >
                  {remaining} restantes
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="modal__actions">
        <button className="button button--primary" onClick={onClose} type="button">
          Fechar
        </button>
      </div>
    </Modal>
  );
}
