import { useState, useCallback } from "react";
import type { ActiveModalType, ModalContextState } from "@/types/modals";

export function useModalController() {
  const [modalState, setModalState] = useState<ModalContextState>({
    type: null,
    payload: undefined,
  });

  const openModal = useCallback(<T = unknown>(type: ActiveModalType, payload?: T) => {
    setModalState({ type, payload });
  }, []);

  const closeModal = useCallback(() => {
    // Garante que o payload e estado sejam limpos ao fechar para evitar vazamento de memória ou dados residuais
    setModalState({ type: null, payload: undefined });
  }, []);

  const isOpen = useCallback(
    (type: ActiveModalType) => modalState.type === type,
    [modalState.type]
  );

  return {
    activeModal: modalState.type,
    modalPayload: modalState.payload,
    openModal,
    closeModal,
    isOpen,
  };
}
