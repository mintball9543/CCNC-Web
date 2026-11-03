/** Server Action 공통 반환 타입 (useActionState 와 함께 사용) */
export type FieldErrors = Record<string, string[] | undefined>;

export interface ActionState<TData = undefined> {
  ok: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
  data?: TData;
  /**
   * 검증 실패 시 사용자가 입력했던 값 (비밀번호 제외).
   * React 19 는 action 완료 후 form 을 reset 하므로 defaultValue 로 복원하는 데 사용한다.
   */
  values?: Record<string, string>;
}

export const initialActionState: ActionState = { ok: false };
