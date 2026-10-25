"use client";

import { useState } from "react";
import { Check, Clock3, Plus, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import type { ModalBaseProps } from "@/types/modals";

interface ModalEventListProps extends ModalBaseProps {
  onNewEvent: () => void;
  allEvents: any[];
  courses: Array<{ id: number; name: string }>;
  onToggleEventStatus: (eventId: number, completedState: boolean) => Promise<void> | void;
  onDeleteEvent: (eventId: number) => Promise<void> | void;
}

export function ModalEventList({
  isOpen,
  onClose,
  onNewEvent,
  allEvents,
  courses,
  onToggleEventStatus,
  onDeleteEvent,
}: ModalEventListProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleToggle = async (id: number, currentCompleted: boolean) => {
    if (processingId !== null) return;
    setProcessingId(id);
    try {
      await onToggleEventStatus(id, !currentCompleted);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (processingId !== null) return;
    if (!window.confirm(`Tem certeza de que deseja remover a entrega "${title}"?`)) {
      return;
    }
    setProcessingId(id);
    try {
      await onDeleteEvent(id);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Modal onClose={onClose} title="Seus Trabalhos e Entregáveis" wide>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <p className="modal__intro" style={{ margin: 0 }}>
          Acompanhe prazos, provas e trabalhos cadastrados no semestre.
        </p>
        <button
          className="button button--primary"
          onClick={() => {
            onClose();
            onNewEvent();
          }}
          type="button"
        >
          <Plus size={16} /> Nova Entrega
        </button>
      </div>

      {allEvents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)" }}>
          <Clock3 size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
          <p>Nenhuma entrega ou prova cadastrada ainda.</p>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxHeight: "420px",
            overflowY: "auto",
            paddingRight: "4px",
          }}
        >
          {allEvents.map((ev) => {
            const course = courses.find((c) => c.id === ev.subject_id);
            const isDone = !!ev.completed;
            const isBusy = processingId === ev.id;
            const formattedDate = ev.event_date
              ? new Date(ev.event_date).toLocaleDateString("pt-BR")
              : "Sem data";

            return (
              <div
                key={ev.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: isDone ? "rgba(46, 204, 113, 0.06)" : "var(--card-bg, #fcfcfc)",
                  border: `1px solid ${isDone ? "rgba(46, 204, 113, 0.25)" : "var(--border)"}`,
                  opacity: isDone ? 0.75 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    disabled={isBusy}
                    onClick={() => handleToggle(ev.id, isDone)}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "6px",
                      border: isDone ? "none" : "2px solid var(--border)",
                      background: isDone ? "var(--mint, #2ecc71)" : "transparent",
                      color: "#fff",
                      cursor: isBusy ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title={isDone ? "Reabrir como pendente" : "Marcar como concluído"}
                    type="button"
                  >
                    {isDone && <Check size={14} strokeWidth={3} />}
                  </button>

                  <div>
                    <strong style={{ textDecoration: isDone ? "line-through" : "none", fontSize: "0.95rem" }}>
                      {ev.title}
                    </strong>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", gap: "8px", marginTop: "2px" }}>
                      <span>{ev.type || "Trabalho"}</span>
                      {course && <span>· {course.name}</span>}
                      <span>· Data: {formattedDate}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: "6px",
                      background: isDone ? "rgba(46, 204, 113, 0.15)" : "rgba(242, 106, 90, 0.12)",
                      color: isDone ? "var(--mint, #2ecc71)" : "var(--coral, #f26a5a)",
                    }}
                  >
                    {isDone ? "Concluído" : "Pendente"}
                  </span>
                  <button
                    aria-label={`Excluir entrega ${ev.title}`}
                    className="icon-button"
                    disabled={isBusy}
                    onClick={() => handleDelete(ev.id, ev.title)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="modal__actions" style={{ marginTop: "20px" }}>
        <button className="button button--primary" onClick={onClose} type="button">
          Fechar
        </button>
      </div>
    </Modal>
  );
}
