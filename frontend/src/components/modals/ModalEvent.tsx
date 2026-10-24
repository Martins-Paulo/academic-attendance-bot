"use client";

import type { FormEvent } from "react";
import { Plus } from "lucide-react";
import { Modal } from "./Modal";

interface ModalEventProps {
  onClose: () => void;
  onSubmit: (e?: FormEvent) => void;
  newEventTitle: string;
  setNewEventTitle: (val: string) => void;
  newEventType: string;
  setNewEventType: (val: string) => void;
  newEventDate: string;
  setNewEventDate: (val: string) => void;
  newEventSubjectId: number | "";
  setNewEventSubjectId: (val: number | "") => void;
  courses: any[];
  isSavingEvent: boolean;
}

export function ModalEvent({
  onClose,
  onSubmit,
  newEventTitle,
  setNewEventTitle,
  newEventType,
  setNewEventType,
  newEventDate,
  setNewEventDate,
  newEventSubjectId,
  setNewEventSubjectId,
  courses,
  isSavingEvent,
}: ModalEventProps) {
  return (
    <Modal onClose={onClose} title="Adicionar Nova Entrega ou Avaliação">
      <form onSubmit={onSubmit}>
        <p className="modal__intro">
          Cadastre trabalhos, projetos, seminários ou provas com data limite.
        </p>
        <div className="form-grid">
          <label className="form-grid__wide">
            Título do Trabalho ou Prova *
            <input
              className="field"
              placeholder="Ex.: Projeto Prático de Banco de Dados"
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
          </label>

          <label>
            Tipo de Avaliação
            <select
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
              value={newEventType}
              onChange={(e) => setNewEventType(e.target.value)}
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
              className="field"
              type="date"
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
            />
          </label>

          <label className="form-grid__wide">
            Disciplina Associada
            <select
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
              value={newEventSubjectId}
              onChange={(e) => setNewEventSubjectId(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Geral / Sem matéria específica</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="modal__actions" style={{ marginTop: "24px" }}>
          <button className="button button--ghost" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="button button--primary" onClick={() => onSubmit()} type="button">
            <Plus size={17} /> {isSavingEvent ? "Salvando..." : "Salvar Entrega"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
