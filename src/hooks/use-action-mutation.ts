"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useCallbackRef } from "./use-callback-ref";
import { ServerActionState } from "../lib/utils";

export type UseActionMutationProps<T> = {
  /** Initial state for useActionState */
  initialState?: ServerActionState<T> | null;
  /** Called when state.success === true */
  onSuccess?: (state: ServerActionState<T>) => void;
  /** Called when state.success === false */
  onError?: (state: ServerActionState<T>, error: string) => void;
};

export type UseActionMutationReturn<T> = {
  /** Manually invoke the action with a FormData payload */
  mutate: (payload: FormData) => void;
  /** Pending flag from useActionState */
  isPending: boolean;
  /** Latest state returned by the action */
  data: ServerActionState<T> | null;
};

/**
 * Action signature expected by React.useActionState:
 * The first param is the *previous state*, the second is the FormData.
 */
export type Action<T> = (
  data: ServerActionState<T> | null,
  formData: FormData
) => ServerActionState<T> | Promise<ServerActionState<T> | null> | null;

/**
 * Wraps React.useActionState and wires side-effect callbacks.
 */
export const useActionMutation = <T>(
  action: Action<T>,
  { initialState, onSuccess, onError }: UseActionMutationProps<T> = {}
): UseActionMutationReturn<T> => {
  const onSuccessRef = useCallbackRef(onSuccess);
  const onErrorRef = useCallbackRef(onError);

  const [formState, formAction] = useActionState(action, initialState ?? null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isPending) return;

    if (formState && !formState.success && formState.error) {
      onErrorRef?.(formState, formState.error);
    } else if (formState && formState.success && formState.response) {
      onSuccessRef?.(formState);
    }
  }, [isPending, formState, onErrorRef, onSuccessRef]);

  const mutate = useCallbackRef((payload: FormData) => {
    startTransition(async () => {
      formAction(payload);
    });
  });

  return { mutate, isPending, data: formState };
};
