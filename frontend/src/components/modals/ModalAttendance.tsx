"use client";

import { Check } from "lucide-react";
import { Modal } from "./Modal";

interface ModalAttendanceProps {
  onClose: () => void;
  courses: any[];
  onPresent: (courseId: number) => void;
}

export function ModalAttendance({ onClose, courses, onPresent }: ModalAttendanceProps) {
  return (
    <Modal onClose={onClose} title="Registrar aula de hoje">
      <p className="modal__intro">Selecione uma disciplina para marcar presença:</p>
      <div className="modal__actions modal__actions--stack">
        {courses.map((c) => (
          <button
            className="button button--primary"
            key={c.id}
            onClick={() => {
              onPresent(c.id);
              onClose();
            }}
            type="button"
          >
            <Check size={18} /> Estive presente em {c.name}
          </button>
        ))}
      </div>
    </Modal>
  );
}
