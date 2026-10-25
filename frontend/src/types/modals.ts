export type ActiveModalType =
  | "ATTENDANCE"
  | "AUTH"
  | "AVATARS"
  | "COURSE"
  | "CRITERIA"
  | "EVENT"
  | "EVENT_LIST"
  | "LIMITS"
  | "PROFILE"
  | null;

export interface ModalContextState<T = unknown> {
  type: ActiveModalType;
  payload?: T;
}

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message?: string) => void;
}

export interface CriteriaModalPayload {
  courseId: number | null;
  courseName?: string;
}

export interface EventModalPayload {
  subjectId?: number | null;
}

export interface AvatarsModalPayload {
  courseId?: number | null;
}
