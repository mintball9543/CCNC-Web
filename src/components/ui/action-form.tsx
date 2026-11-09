"use client";

import { createContext, useTransition, type ComponentProps } from "react";

/** ActionForm 제출 진행 상태 (SubmitButton 이 함께 읽는다) */
export const FormPendingContext = createContext(false);

type ActionFormProps = Omit<ComponentProps<"form">, "action" | "onSubmit"> & {
  /** useActionState 의 dispatch 함수 */
  action: (formData: FormData) => void;
};

/**
 * Server Action 폼.
 *
 * React 19 는 `<form action={fn}>` 제출이 끝나면 폼을 자동으로 초기화한다(form.reset).
 * 그래서 서버 검증에 실패하면 드롭다운·라디오·입력칸이 처음 값으로 되돌아갔다.
 * 이 컴포넌트는 submit 이벤트에서 직접 FormData 를 만들어 액션을 실행하므로
 * 자동 초기화가 일어나지 않고, 사용자가 입력한 값이 그대로 남는다.
 */
export function ActionForm({ action, children, ...props }: ActionFormProps) {
  const [pending, startTransition] = useTransition();

  return (
    <FormPendingContext value={pending}>
      <form
        {...props}
        onSubmit={(event) => {
          event.preventDefault();
          if (pending) return;
          const submitter = (event.nativeEvent as SubmitEvent).submitter;
          const formData = new FormData(event.currentTarget, submitter ?? undefined);
          startTransition(() => action(formData));
        }}
      >
        {children}
      </form>
    </FormPendingContext>
  );
}
