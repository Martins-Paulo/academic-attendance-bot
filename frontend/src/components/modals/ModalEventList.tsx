"use client";

import { Check, Clock3, Plus, Trash2 } from "lucide-react";
import { Modal } from "./Modal";

interface ModalEventListProps {
  onClose: () => void;
  onNewEvent: () => void;
  allEvents: any[];
  courses: any[];
  onToggleEventStatus: (eventId: number, completedState: boolean) => void;
  onDeleteEvent: (eventId: number) => void;
}

export function ModalEventList({
  onClose,
  onNewEvent,
  allEvents,
  courses,
  onToggleEventStatus,
  onDeleteEvent,
}: ModalEventListProps) {
  return (
    <Modal onClose={onClose} title="Seus Trabalhos e Entregáveis" wide>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <p className="modal__intro" style={{ margin: 0 }}>
          Acompanhe prazos, provas e trabalhos cadastrados no semestre.
        </p>
        <button className="button button--primary" onClick={onNewEvent} type="button">
          <Plus size={16} /> Nova Entrega
        </button>
      </div>

      {allEvents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)" }}>
          <Clock3 size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
          <p>Nenhuma entrega ou prova cadastrada ainda.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "420px", overflowY: "auto", paddingRight: "4px" }}>
          {allEvents.map((ev) => {
            const course = courses.find((c) => c.id === ev.subject_id);
            const isDone = !!ev.completed;
            const formattedDate = ev.event_date ? new Date(ev.event_date).toLocaleDateString("pt-BR") : "Sem data";

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
                    type="button"
                    onClick={() => onToggleEventStatus(ev.id, !isDone)}
                    title={isDone ? "Reabrir como pendente" : "Marcar como concluído"}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "6px",
                      border: isDone ? "none" : "2px solid var(--border)",
                      background: isDone ? "var(--mint, #2ecc71)" : "transparent",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
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
                    aria-label="Excluir entrega"
                    className="icon-button"
                    onClick={() => onDeleteEvent(ev.id)}
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
