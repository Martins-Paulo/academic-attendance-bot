"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Modal } from "./Modal";
import { AttendanceMood, courseAvatarStyles } from "@/app/(frontend)/UniGagApp";
import type { ModalBaseProps } from "@/types/modals";

interface ModalAvatarsProps extends ModalBaseProps {
  courses: Array<{
    id: number;
    name: string;
    code: string;
    color: string;
    avatar?: string;
  }>;
  initialCourseId?: number | null;
  onUpdateAvatar: (subjectId: number, avatarStyle: string) => void;
}

export function ModalAvatars({
  isOpen,
  onClose,
  onSuccess,
  courses,
  initialCourseId,
  onUpdateAvatar,
}: ModalAvatarsProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [localAvatars, setLocalAvatars] = useState<Record<number, string>>({});

  useEffect(() => {
    if (isOpen) {
      const activeId = initialCourseId || (courses.length > 0 ? courses[0].id : null);
      setSelectedCourseId(activeId);

      const mapping: Record<number, string> = {};
      courses.forEach((c) => {
        mapping[c.id] = c.avatar || "diva";
      });
      setLocalAvatars(mapping);
    }
  }, [isOpen, initialCourseId, courses]);

  if (!isOpen) return null;

  const currentCourse = courses.find((c) => c.id === selectedCourseId);
  const currentAvatar = selectedCourseId ? (localAvatars[selectedCourseId] || currentCourse?.avatar || "diva") : "diva";

  const handleSelectStyle = (styleId: string) => {
    if (!selectedCourseId) return;
    setLocalAvatars((prev) => ({ ...prev, [selectedCourseId]: styleId }));
    onUpdateAvatar(selectedCourseId, styleId);
  };

  const handleSave = () => {
    onSuccess?.("Avatares acadêmicos salvos com sucesso!");
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Avatares das Disciplinas" wide>
      <p className="modal__intro">
        Escolha um personagem representativo para cada disciplina. Suas expressões reagem em tempo real à saúde da sua frequência acadêmica!
      </p>

      {courses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
          Nenhuma matéria cadastrada no semestre.
        </div>
      ) : (
        <>
          <div className="avatar-course-tabs" role="tablist">
            {courses.map((course) => (
              <button
                key={course.id}
                className={selectedCourseId === course.id ? "is-active" : ""}
                onClick={() => setSelectedCourseId(course.id)}
                type="button"
              >
                <span className={`course__code course__code--${course.color}`}>{course.code}</span>
                {course.name}
              </button>
            ))}
          </div>

          <div className="avatar-style-heading">
            <span>Personagem para:</span>
            <strong>{currentCourse?.name || "Disciplina"}</strong>
          </div>

          <div className="avatar-style-grid">
            {courseAvatarStyles.map((style) => {
              const isSelected = currentAvatar === style.id;
              return (
                <button
                  key={style.id}
                  className={isSelected ? "avatar-style-option is-selected" : "avatar-style-option"}
                  onClick={() => handleSelectStyle(style.id)}
                  type="button"
                >
                  <AttendanceMood avatar={style.id} ratio={0.15} />
                  <span>{style.label}</span>
                  {isSelected && (
                    <i>
                      <Check size={11} />
                    </i>
                  )}
                </button>
              );
            })}
          </div>

          <div className="avatar-health-demo">
            <span>Reação expressiva à sua frequência:</span>
            <div>
              <span>
                <AttendanceMood avatar={currentAvatar} ratio={0.1} />
                Confiante
              </span>
              <span>
                <AttendanceMood avatar={currentAvatar} ratio={0.6} />
                Preocupada
              </span>
              <span>
                <AttendanceMood avatar={currentAvatar} ratio={0.9} />
                Crítica
              </span>
            </div>
          </div>
        </>
      )}

      <div className="modal__actions">
        <button className="button button--primary" onClick={handleSave} type="button">
          <Check size={17} /> Salvar Escolhas
        </button>
      </div>
    </Modal>
  );
}
