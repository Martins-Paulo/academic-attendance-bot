"use client";

import { Modal } from "./Modal";

interface ModalLimitsProps {
  onClose: () => void;
  courses: any[];
}

export function ModalLimits({ onClose, courses }: ModalLimitsProps) {
  return (
    <Modal onClose={onClose} title="Diagnóstico de Faltas">
      <p className="modal__intro">
        Acompanhe o saldo restante de faltas em cada disciplina antes de reprovar por frequência:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
        {courses.map((c) => {
          const remaining = Math.max(0, (c.limit || 16) - (c.absences || 0));
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
                border: `1px solid ${isCrit ? "var(--coral)" : "var(--border)"}`,
              }}
            >
              <div>
                <strong>{c.name}</strong>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  {c.absences} faltas usadas de {c.limit} permitidas
                </div>
              </div>
              <span
                style={{
                  fontWeight: 700,
                  color: isCrit ? "var(--coral)" : "var(--mint)",
                }}
              >
                {remaining} restantes
              </span>
            </div>
          );
        })}
      </div>
      <div className="modal__actions">
        <button className="button button--primary" onClick={onClose} type="button">
          Fechar
        </button>
      </div>
    </Modal>
  );
}
