"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className={wide ? "modal modal--wide" : "modal"}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="modal__header">
          <div>
            <div className="eyebrow">UniGag</div>
            <div className="modal__title">{title}</div>
          </div>
          <button
            aria-label="Fechar modal"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
