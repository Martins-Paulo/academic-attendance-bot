"use client";

import { Check } from "lucide-react";
import { Modal } from "./Modal";
import { AttendanceMood, courseAvatarStyles } from "@/app/(frontend)/UniGagApp";

interface ModalAvatarsProps {
  onClose: () => void;
  courses: any[];
  avatarCourseId: number | null;
  setAvatarCourseId: (id: number) => void;
  selectAvatarForSubject: (subjectId: number, avatarStyle: string) => void;
  onSave: () => void;
}

export function ModalAvatars({
  onClose,
  courses,
  avatarCourseId,
  setAvatarCourseId,
  selectAvatarForSubject,
  onSave,
}: ModalAvatarsProps) {
  return (
    <Modal onClose={onClose} title="Avatares das Matérias" wide>
      <p className="modal__intro">
        Escolha um personagem representativo para cada disciplina. Suas expressões reagem em tempo real à saúde da sua frequência acadêmica!
      </p>

      <div className="avatar-course-tabs" role="tablist">
        {courses.map((course) => (
          <button
            key={course.id}
            className={avatarCourseId === course.id ? "is-active" : ""}
            onClick={() => setAvatarCourseId(course.id)}
            type="button"
          >
            <span className={`course__code course__code--${course.color}`}>{course.code}</span>
            {course.name}
          </button>
        ))}
      </div>

      <div className="avatar-style-heading">
        <span>Personagem para:</span>
        <strong>{courses.find((c) => c.id === avatarCourseId)?.name}</strong>
      </div>

      <div className="avatar-style-grid">
        {courseAvatarStyles.map((style) => {
          const selectedCourse = courses.find((c) => c.id === avatarCourseId);
          const isSelected = selectedCourse?.avatar === style.id;
          return (
            <button
              key={style.id}
              className={isSelected ? "avatar-style-option is-selected" : "avatar-style-option"}
              onClick={() => {
                if (avatarCourseId) {
                  selectAvatarForSubject(avatarCourseId, style.id);
                }
              }}
              type="button"
            >
              <AttendanceMood avatar={style.id} ratio={0.15} />
              <span>{style.label}</span>
              {isSelected && <i><Check size={11} /></i>}
            </button>
          );
        })}
      </div>

      <div className="avatar-health-demo">
        <span>Reação expressiva à sua frequência:</span>
        <div>
          <span>
            <AttendanceMood avatar={courses.find((c) => c.id === avatarCourseId)?.avatar || "diva"} ratio={0.1} />
            Confiante
          </span>
          <span>
            <AttendanceMood avatar={courses.find((c) => c.id === avatarCourseId)?.avatar || "diva"} ratio={0.6} />
            Preocupada
          </span>
          <span>
            <AttendanceMood avatar={courses.find((c) => c.id === avatarCourseId)?.avatar || "diva"} ratio={0.9} />
            Crítica
          </span>
        </div>
      </div>

      <div className="modal__actions">
        <button className="button button--primary" onClick={onSave} type="button">
          <Check size={17} /> Salvar escolhas
        </button>
      </div>
    </Modal>
  );
}
