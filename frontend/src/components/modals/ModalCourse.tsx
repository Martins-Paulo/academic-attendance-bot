"use client";

import type { FormEvent } from "react";
import { Plus } from "lucide-react";
import { Modal } from "./Modal";
import { courseAvatarStyles } from "@/app/(frontend)/UniGagApp";

interface ModalCourseProps {
  onClose: () => void;
  onSubmit: (e?: FormEvent) => void;
  newCourseName: string;
  setNewCourseName: (val: string) => void;
  newCourseCode: string;
  setNewCourseCode: (val: string) => void;
  newCourseAvatar: string;
  setNewCourseAvatar: (val: string) => void;
  newCourseClasses: number;
  setNewCourseClasses: (val: number) => void;
  newCourseLimit: number;
  setNewCourseLimit: (val: number) => void;
  isSavingCourse: boolean;
}

export function ModalCourse({
  onClose,
  onSubmit,
  newCourseName,
  setNewCourseName,
  newCourseCode,
  setNewCourseCode,
  newCourseAvatar,
  setNewCourseAvatar,
  newCourseClasses,
  setNewCourseClasses,
  newCourseLimit,
  setNewCourseLimit,
  isSavingCourse,
}: ModalCourseProps) {
  return (
    <Modal onClose={onClose} title="Cadastrar Nova Matéria">
      <form onSubmit={onSubmit}>
        <p className="modal__intro">
          Adicione uma nova disciplina à sua grade. Os dados serão salvos no Supabase.
        </p>
        <div className="form-grid">
          <label className="form-grid__wide">
            Nome da Matéria *
            <input
              className="field"
              placeholder="Ex.: Inteligência Artificial"
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
            />
          </label>

          <label>
            Código da Matéria
            <input
              className="field"
              placeholder="Ex.: INF0320"
              type="text"
              value={newCourseCode}
              onChange={(e) => setNewCourseCode(e.target.value)}
            />
          </label>

          <label>
            Personagem Inicial
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
              value={newCourseAvatar}
              onChange={(e) => setNewCourseAvatar(e.target.value)}
            >
              {courseAvatarStyles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Total de Aulas
            <input
              className="field"
              type="number"
              value={String(newCourseClasses)}
              onChange={(e) => {
                const classes = Number(e.target.value) || 0;
                setNewCourseClasses(classes);
                setNewCourseLimit(Math.round(classes * 0.25));
              }}
            />
          </label>

          <label>
            Limite de Faltas (25%)
            <input
              className="field"
              type="number"
              value={String(newCourseLimit)}
              onChange={(e) => setNewCourseLimit(Number(e.target.value) || 0)}
            />
          </label>
        </div>

        <div className="modal__actions" style={{ marginTop: "24px" }}>
          <button className="button button--ghost" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="button button--primary" onClick={() => onSubmit()} type="button">
            <Plus size={17} /> {isSavingCourse ? "Salvando..." : "Adicionar Matéria"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
