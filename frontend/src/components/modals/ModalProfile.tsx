"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { z } from "zod";
import { Modal } from "./Modal";
import type { ModalBaseProps } from "@/types/modals";

export const profileHealthOptions = [
  { emoji: "😎", label: "Plena" },
  { emoji: "🤓", label: "Focada" },
  { emoji: "☕", label: "À base de café" },
  { emoji: "😵‍💫", label: "Surtando" },
  { emoji: "💅", label: "Entregando tudo" },
  { emoji: "😴", label: "Modo soneca" },
];

const profileSchema = z.object({
  health: z.string().min(1, "Selecione seu humor atual.").max(10),
  name: z
    .string()
    .trim()
    .min(2, "O nome deve conter ao menos 2 caracteres.")
    .max(60, "O nome não pode exceder 60 caracteres.")
    .regex(/^[^<>%$]*$/, "Caracteres inválidos detectados."),
  education: z
    .string()
    .trim()
    .min(2, "Curso/Faculdade deve conter ao menos 2 caracteres.")
    .max(100, "Descrição de formação muito longa.")
    .regex(/^[^<>%$]*$/, "Caracteres inválidos detectados."),
  phone: z
    .string()
    .trim()
    .max(25, "Telefone muito longo.")
    .optional()
    .or(z.literal("")),
});

interface ModalProfileProps extends ModalBaseProps {
  initialHealth: string;
  initialName: string;
  initialEducation: string;
  initialPhone?: string;
  onUpdateProfile: (data: { name: string; education: string; health: string; phone?: string }) => void;
}

export function ModalProfile({
  isOpen,
  onClose,
  onSuccess,
  initialHealth,
  initialName,
  initialEducation,
  initialPhone = "",
  onUpdateProfile,
}: ModalProfileProps) {
  const [health, setHealth] = useState(initialHealth);
  const [name, setName] = useState(initialName);
  const [education, setEducation] = useState(initialEducation);
  const [phone, setPhone] = useState(initialPhone);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setHealth(initialHealth);
      setName(initialName);
      setEducation(initialEducation);
      setPhone(initialPhone || "");
      setErrors({});
    }
  }, [isOpen, initialHealth, initialName, initialEducation, initialPhone]);

  if (!isOpen) return null;

  const handleSave = () => {
    setErrors({});
    const validation = profileSchema.safeParse({ health, name, education, phone });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const path = String(issue.path[0]);
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    onUpdateProfile(validation.data);
    onSuccess?.("Perfil acadêmico atualizado!");
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Meu Perfil Acadêmico">
      <div className="profile-editor__preview">
        <span className="profile-editor__avatar">{health}</span>
        <span>
          <strong>{name}</strong>
          <small>{education}</small>
        </span>
      </div>

      <div style={{ marginTop: "16px" }}>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "4px" }}>
          Nome do Estudante:
          <input
            className={`field ${errors.name ? "is-invalid" : ""}`}
            maxLength={60}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            style={{ marginTop: "4px" }}
            type="text"
            value={name}
          />
          {errors.name && (
            <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem" }}>{errors.name}</span>
          )}
        </label>
      </div>

      <div style={{ marginTop: "12px" }}>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "4px" }}>
          Curso e Instituição:
          <input
            className={`field ${errors.education ? "is-invalid" : ""}`}
            maxLength={100}
            onChange={(e) => {
              setEducation(e.target.value);
              if (errors.education) setErrors((prev) => ({ ...prev, education: "" }));
            }}
            style={{ marginTop: "4px" }}
            type="text"
            value={education}
          />
          {errors.education && (
            <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem" }}>{errors.education}</span>
          )}
        </label>
      </div>

      <div style={{ marginTop: "12px" }}>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "4px" }}>
          WhatsApp / Telefone (Integração Bot UniGag):
          <input
            className={`field ${errors.phone ? "is-invalid" : ""}`}
            maxLength={25}
            placeholder="(DD) 99999-9999 ou 5511999998888"
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
            }}
            style={{ marginTop: "4px" }}
            type="tel"
            value={phone}
          />
          {errors.phone && (
            <span style={{ color: "var(--coral, #eb5757)", fontSize: "0.78rem" }}>{errors.phone}</span>
          )}
        </label>
        <span style={{ fontSize: "0.75rem", color: "var(--muted, #828282)" }}>
          📱 Usado pelo Bot do WhatsApp para identificação automática e confirmação de presença.
        </span>
      </div>

      <div className="health-picker" style={{ marginTop: "16px" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "8px" }}>
          Como você está se sentindo hoje?
        </span>
        <div className="health-picker__grid">
          {profileHealthOptions.map((item) => (
            <button
              key={item.label}
              className={health === item.emoji ? "health-option is-selected" : "health-option"}
              onClick={() => setHealth(item.emoji)}
              type="button"
            >
              <span>{item.emoji}</span>
              <small>{item.label}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="modal__actions" style={{ marginTop: "24px" }}>
        <button className="button button--ghost" onClick={onClose} type="button">
          Cancelar
        </button>
        <button className="button button--primary" onClick={handleSave} type="button">
          <Check size={16} /> Salvar Perfil
        </button>
      </div>
    </Modal>
  );
}
