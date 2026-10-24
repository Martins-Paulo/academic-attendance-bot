"use client";

import { Modal } from "./Modal";

export const profileHealthOptions = [
  { emoji: "😎", label: "Plena" },
  { emoji: "🤓", label: "Focada" },
  { emoji: "☕", label: "À base de café" },
  { emoji: "😵‍💫", label: "Surtando" },
  { emoji: "💅", label: "Entregando tudo" },
  { emoji: "😴", label: "Modo soneca" },
];

interface ModalProfileProps {
  onClose: () => void;
  profileHealth: string;
  setProfileHealth: (emoji: string) => void;
  profileName: string;
  profileEducation: string;
}

export function ModalProfile({
  onClose,
  profileHealth,
  setProfileHealth,
  profileName,
  profileEducation,
}: ModalProfileProps) {
  return (
    <Modal onClose={onClose} title="Meu perfil">
      <div className="profile-editor__preview">
        <span className="profile-editor__avatar">{profileHealth}</span>
        <span>
          <strong>{profileName}</strong>
          <small>{profileEducation}</small>
        </span>
      </div>
      <div className="health-picker">
        <div className="health-picker__grid">
          {profileHealthOptions.map((item) => (
            <button
              key={item.label}
              className={profileHealth === item.emoji ? "health-option is-selected" : "health-option"}
              onClick={() => setProfileHealth(item.emoji)}
              type="button"
            >
              <span>{item.emoji}</span>
              <small>{item.label}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="modal__actions">
        <button className="button button--primary" onClick={onClose} type="button">
          Fechar
        </button>
      </div>
    </Modal>
  );
}
