import { renderHook, act } from "@testing-library/react";
import { useActionMutation, Action } from "../use-action-mutation";
import { ServerActionState } from "../../lib/utils";

const mockUseActionState = jest.fn();
const mockUseTransition = jest.fn();
const mockFormAction = jest.fn();
const mockStartTransition = jest.fn();

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useActionState: (...args: any[]) => mockUseActionState(...args),
  useTransition: (...args: any[]) => mockUseTransition(...args),
}));

describe("useActionMutation", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseActionState.mockReturnValue([null, mockFormAction]);
    mockStartTransition.mockImplementation((fn: jest.Mock) => fn());
    mockUseTransition.mockReturnValue([false, mockStartTransition]);
  });

  describe("Basic functionality", () => {
    it("should initialize with default values", () => {
      const mockAction: Action<string> = jest.fn();

      const { result } = renderHook(() => useActionMutation(mockAction));

      expect(result.current.mutate).toBeInstanceOf(Function);
      expect(result.current.isPending).toBe(false);
      expect(result.current.data).toBeNull();
      expect(mockUseActionState).toHaveBeenCalledWith(mockAction, null);
    });

    it("should initialize with custom initial state", () => {
      const mockAction: Action<string> = jest.fn();
      const initialState: ServerActionState<string> = {
        success: true,
        response: "initial-data",
      };

      renderHook(() => useActionMutation(mockAction, { initialState }));

      expect(mockUseActionState).toHaveBeenCalledWith(mockAction, initialState);
    });

    it("should call formAction when mutate is invoked", () => {
      const mockAction: Action<string> = jest.fn();
      const { result } = renderHook(() => useActionMutation(mockAction));

      const formData = new FormData();
      formData.append("test", "value");

      act(() => {
        result.current.mutate(formData);
      });

      expect(mockStartTransition).toHaveBeenCalledWith(expect.any(Function));
      expect(mockFormAction).toHaveBeenCalledWith(formData);
    });

    it("should reflect pending state from useActionState", () => {
      const mockAction: Action<string> = jest.fn();

      mockUseActionState.mockReturnValue([null, mockFormAction]);
      mockUseTransition.mockReturnValue([true, mockStartTransition]);

      const { result } = renderHook(() => useActionMutation(mockAction));

      expect(result.current.isPending).toBe(true);
    });

    it("should return form state as data", () => {
      const mockAction: Action<string> = jest.fn();
      const formState: ServerActionState<string> = {
        success: true,
        response: "test-data",
      };

      mockUseActionState.mockReturnValue([formState, mockFormAction]);

      const { result } = renderHook(() => useActionMutation(mockAction));

      expect(result.current.data).toBe(formState);
    });
  });

  describe("Success callback", () => {
    it("should call onSuccess when state is successful", () => {
      const mockAction: Action<string> = jest.fn();
      const onSuccess = jest.fn();
      const successState: ServerActionState<string> = {
        success: true,
        response: "success-data",
      };

      mockUseActionState.mockReturnValue([null, mockFormAction]);
      mockUseTransition.mockReturnValue([true, mockStartTransition]);

      const { rerender } = renderHook(() =>
        useActionMutation(mockAction, { onSuccess })
      );

      mockUseActionState.mockReturnValue([successState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      act(() => {
        rerender();
      });

      expect(onSuccess).toHaveBeenCalledWith(successState);
    });

    it("should not call onSuccess when state is not successful", () => {
      const mockAction: Action<string> = jest.fn();
      const onSuccess = jest.fn();
      const errorState: ServerActionState<string> = {
        success: false,
        error: "test-error",
      };

      mockUseActionState.mockReturnValue([errorState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      renderHook(() => useActionMutation(mockAction, { onSuccess }));

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("should not call onSuccess when still pending", () => {
      const mockAction: Action<string> = jest.fn();
      const onSuccess = jest.fn();
      const successState: ServerActionState<string> = {
        success: true,
        response: "success-data",
      };

      mockUseActionState.mockReturnValue([successState, mockFormAction]);
      mockUseTransition.mockReturnValue([true, mockStartTransition]);

      renderHook(() => useActionMutation(mockAction, { onSuccess }));

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("should not call onSuccess when state is successful but has no response", () => {
      const mockAction: Action<string> = jest.fn();
      const onSuccess = jest.fn();
      const successState: ServerActionState<string> = {
        success: true,
      };

      mockUseActionState.mockReturnValue([successState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      renderHook(() => useActionMutation(mockAction, { onSuccess }));

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Error callback", () => {
    it("should call onError when state has error", () => {
      const mockAction: Action<string> = jest.fn();
      const onError = jest.fn();
      const errorState: ServerActionState<string> = {
        success: false,
        error: "test-error",
      };

      mockUseActionState.mockReturnValue([null, mockFormAction]);
      mockUseTransition.mockReturnValue([true, mockStartTransition]);

      const { rerender } = renderHook(() =>
        useActionMutation(mockAction, { onError })
      );

      mockUseActionState.mockReturnValue([errorState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      act(() => {
        rerender();
      });

      expect(onError).toHaveBeenCalledWith(errorState, "test-error");
    });

    it("should not call onError when state is successful", () => {
      const mockAction: Action<string> = jest.fn();
      const onError = jest.fn();
      const successState: ServerActionState<string> = {
        success: true,
        response: "success-data",
      };

      mockUseActionState.mockReturnValue([successState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      renderHook(() => useActionMutation(mockAction, { onError }));

      expect(onError).not.toHaveBeenCalled();
    });

    it("should not call onError when still pending", () => {
      const mockAction: Action<string> = jest.fn();
      const onError = jest.fn();
      const errorState: ServerActionState<string> = {
        success: false,
        error: "test-error",
      };

      mockUseActionState.mockReturnValue([errorState, mockFormAction]);
      mockUseTransition.mockReturnValue([true, mockStartTransition]);

      renderHook(() => useActionMutation(mockAction, { onError }));

      expect(onError).not.toHaveBeenCalled();
    });

    it("should not call onError when state is unsuccessful but has no error", () => {
      const mockAction: Action<string> = jest.fn();
      const onError = jest.fn();
      const errorState: ServerActionState<string> = {
        success: false,
      };

      mockUseActionState.mockReturnValue([errorState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      renderHook(() => useActionMutation(mockAction, { onError }));

      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe("Callback stability", () => {
    it("should update callback behavior when callbacks change", () => {
      const mockAction: Action<string> = jest.fn();
      const onSuccess1 = jest.fn();
      const onSuccess2 = jest.fn();
      const successState: ServerActionState<string> = {
        success: true,
        response: "success-data",
      };

      const { rerender } = renderHook(
        ({ success }) => useActionMutation(mockAction, { onSuccess: success }),
        { initialProps: { success: onSuccess1 } }
      );

      rerender({ success: onSuccess2 });

      mockUseActionState.mockReturnValue([successState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      act(() => {
        rerender({ success: onSuccess2 });
      });

      expect(onSuccess1).not.toHaveBeenCalled();
      expect(onSuccess2).toHaveBeenCalledWith(successState);
    });
  });

  describe("Edge cases", () => {
    it("should handle null form state", () => {
      const mockAction: Action<string> = jest.fn();
      const onSuccess = jest.fn();
      const onError = jest.fn();

      mockUseActionState.mockReturnValue([null, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      const { result } = renderHook(() =>
        useActionMutation(mockAction, { onSuccess, onError })
      );

      expect(result.current.data).toBeNull();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it("should handle state without success or error properties", () => {
      const mockAction: Action<string> = jest.fn();
      const onSuccess = jest.fn();
      const onError = jest.fn();
      const incompleteState = {} as ServerActionState<string>;

      mockUseActionState.mockReturnValue([incompleteState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      renderHook(() => useActionMutation(mockAction, { onSuccess, onError }));

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it("should handle empty props object", () => {
      const mockAction: Action<string> = jest.fn();

      const { result } = renderHook(() => useActionMutation(mockAction, {}));

      expect(result.current.mutate).toBeInstanceOf(Function);
      expect(result.current.isPending).toBe(false);
      expect(result.current.data).toBeNull();
    });

    it("should handle no props object", () => {
      const mockAction: Action<string> = jest.fn();

      const { result } = renderHook(() => useActionMutation(mockAction));

      expect(result.current.mutate).toBeInstanceOf(Function);
      expect(result.current.isPending).toBe(false);
      expect(result.current.data).toBeNull();
    });
  });

  describe("Complex scenarios", () => {
    it("should handle multiple state transitions correctly", () => {
      const mockAction: Action<string> = jest.fn();
      const onSuccess = jest.fn();
      const onError = jest.fn();

      mockUseActionState.mockReturnValue([null, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      const { rerender } = renderHook(() =>
        useActionMutation(mockAction, { onSuccess, onError })
      );

      mockUseActionState.mockReturnValue([null, mockFormAction]);
      mockUseTransition.mockReturnValue([true, mockStartTransition]);
      act(() => rerender());

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();

      const successState: ServerActionState<string> = {
        success: true,
        response: "success-data",
      };
      mockUseActionState.mockReturnValue([successState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      act(() => rerender());

      expect(onSuccess).toHaveBeenCalledWith(successState);
      expect(onError).not.toHaveBeenCalled();

      onSuccess.mockClear();
      onError.mockClear();

      mockUseActionState.mockReturnValue([successState, mockFormAction]);
      mockUseTransition.mockReturnValue([true, mockStartTransition]);
      act(() => rerender());

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();

      const errorState: ServerActionState<string> = {
        success: false,
        error: "test-error",
      };
      mockUseActionState.mockReturnValue([errorState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      act(() => rerender());

      expect(onError).toHaveBeenCalledWith(errorState, "test-error");
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("should handle rapid callback changes during pending state", () => {
      const mockAction: Action<string> = jest.fn();
      const onSuccess1 = jest.fn();
      const onSuccess2 = jest.fn();
      const successState: ServerActionState<string> = {
        success: true,
        response: "success-data",
      };

      mockUseActionState.mockReturnValue([null, mockFormAction]);
      mockUseTransition.mockReturnValue([true, mockStartTransition]);

      const { rerender } = renderHook(
        ({ success }) => useActionMutation(mockAction, { onSuccess: success }),
        { initialProps: { success: onSuccess1 } }
      );

      rerender({ success: onSuccess2 });

      mockUseActionState.mockReturnValue([successState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      act(() => rerender({ success: onSuccess2 }));

      expect(onSuccess2).toHaveBeenCalledWith(successState);
      expect(onSuccess1).not.toHaveBeenCalled();
    });

    it("should handle both success and error callbacks in same hook instance", () => {
      const mockAction: Action<string> = jest.fn();
      const onSuccess = jest.fn();
      const onError = jest.fn();

      mockUseActionState.mockReturnValue([null, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      const { rerender } = renderHook(() =>
        useActionMutation(mockAction, { onSuccess, onError })
      );

      const successState: ServerActionState<string> = {
        success: true,
        response: "success-data",
      };
      mockUseActionState.mockReturnValue([successState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      act(() => rerender());

      expect(onSuccess).toHaveBeenCalledWith(successState);
      expect(onError).not.toHaveBeenCalled();

      onSuccess.mockClear();
      onError.mockClear();

      const errorState: ServerActionState<string> = {
        success: false,
        error: "test-error",
      };
      mockUseActionState.mockReturnValue([errorState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      act(() => rerender());

      expect(onError).toHaveBeenCalledWith(errorState, "test-error");
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Type safety", () => {
    it("should work with different data types", () => {
      interface TestData {
        id: number;
        name: string;
      }

      const mockAction: Action<TestData> = jest.fn();
      const onSuccess = jest.fn();
      const successState: ServerActionState<TestData> = {
        success: true,
        response: { id: 1, name: "test" },
      };

      mockUseActionState.mockReturnValue([successState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      renderHook(() => useActionMutation(mockAction, { onSuccess }));

      expect(onSuccess).toHaveBeenCalledWith(successState);
    });

    it("should work with undefined callbacks", () => {
      const mockAction: Action<string> = jest.fn();
      const successState: ServerActionState<string> = {
        success: true,
        response: "success-data",
      };

      mockUseActionState.mockReturnValue([successState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      const { result } = renderHook(() =>
        useActionMutation(mockAction, {
          onSuccess: undefined,
          onError: undefined,
        })
      );

      expect(result.current.data).toBe(successState);
    });
  });

  describe("FormData handling", () => {
    it("should pass FormData correctly to mutate function", () => {
      const mockAction: Action<string> = jest.fn();
      const { result } = renderHook(() => useActionMutation(mockAction));

      const formData = new FormData();
      formData.append("name", "test-name");
      formData.append("email", "test@example.com");

      act(() => {
        result.current.mutate(formData);
      });

      expect(mockFormAction).toHaveBeenCalledWith(formData);
      expect(mockFormAction).toHaveBeenCalledTimes(1);
    });

    it("should handle empty FormData", () => {
      const mockAction: Action<string> = jest.fn();
      const { result } = renderHook(() => useActionMutation(mockAction));

      const emptyFormData = new FormData();

      act(() => {
        result.current.mutate(emptyFormData);
      });

      expect(mockFormAction).toHaveBeenCalledWith(emptyFormData);
    });

    it("should handle multiple mutate calls", () => {
      const mockAction: Action<string> = jest.fn();
      const { result } = renderHook(() => useActionMutation(mockAction));

      const formData1 = new FormData();
      formData1.append("test", "value1");

      const formData2 = new FormData();
      formData2.append("test", "value2");

      act(() => {
        result.current.mutate(formData1);
      });

      act(() => {
        result.current.mutate(formData2);
      });

      expect(mockFormAction).toHaveBeenCalledTimes(2);
      expect(mockFormAction).toHaveBeenNthCalledWith(1, formData1);
      expect(mockFormAction).toHaveBeenNthCalledWith(2, formData2);
    });
  });

  describe("Effect dependencies", () => {
    it("should only trigger effect when isPending or formState changes", () => {
      const mockAction: Action<string> = jest.fn();
      const onSuccess = jest.fn();

      mockUseActionState.mockReturnValue([null, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      const { rerender } = renderHook(
        ({ success }) => useActionMutation(mockAction, { onSuccess: success }),
        { initialProps: { success: onSuccess } }
      );

      const newOnSuccess = jest.fn();
      rerender({ success: newOnSuccess });

      expect(onSuccess).not.toHaveBeenCalled();
      expect(newOnSuccess).not.toHaveBeenCalled();

      const successState: ServerActionState<string> = {
        success: true,
        response: "success-data",
      };
      mockUseActionState.mockReturnValue([successState, mockFormAction]);
      mockUseTransition.mockReturnValue([false, mockStartTransition]);

      act(() => rerender({ success: newOnSuccess }));

      expect(newOnSuccess).toHaveBeenCalledWith(successState);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Mutate function stability", () => {
    it("should maintain stable mutate function reference", () => {
      const mockAction: Action<string> = jest.fn();

      const { result, rerender } = renderHook(() =>
        useActionMutation(mockAction)
      );

      const firstMutate = result.current.mutate;

      rerender();
      rerender();
      rerender();

      expect(result.current.mutate).toBe(firstMutate);
    });
  });
});
