import { renderHook } from "@testing-library/react";
import { useCallbackRef } from "../use-callback-ref";

describe("useCallbackRef", () => {
  it("should return a stable function reference", () => {
    const callback = jest.fn();
    const { result, rerender } = renderHook(({ cb }) => useCallbackRef(cb), {
      initialProps: { cb: callback },
    });

    const firstRef = result.current;

    rerender({ cb: callback });
    const secondRef = result.current;

    expect(firstRef).toBe(secondRef);
  });

  it("should call the latest callback when invoked", () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    const { result, rerender } = renderHook(({ cb }) => useCallbackRef(cb), {
      initialProps: { cb: callback1 },
    });

    result.current("arg1", "arg2");
    expect(callback1).toHaveBeenCalledWith("arg1", "arg2");
    expect(callback2).not.toHaveBeenCalled();

    rerender({ cb: callback2 });

    result.current("arg3", "arg4");
    expect(callback2).toHaveBeenCalledWith("arg3", "arg4");
    expect(callback1).toHaveBeenCalledTimes(1);
  });

  it("should handle undefined callback gracefully", () => {
    const { result } = renderHook(() => useCallbackRef(undefined));

    expect(() => result.current()).not.toThrow();
  });

  it("should handle callback that returns a value", () => {
    const callback = jest.fn().mockReturnValue("return-value");
    const { result } = renderHook(() => useCallbackRef(callback));

    const returnValue = result.current("test-arg");

    expect(callback).toHaveBeenCalledWith("test-arg");
    expect(returnValue).toBe("return-value");
  });

  it("should handle callback with different argument types", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useCallbackRef(callback));

    result.current(1, "string", { key: "value" }, [1, 2, 3], true, null);

    expect(callback).toHaveBeenCalledWith(
      1,
      "string",
      { key: "value" },
      [1, 2, 3],
      true,
      null
    );
  });

  it("should update callback reference when callback changes", () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    const { result, rerender } = renderHook(({ cb }) => useCallbackRef(cb), {
      initialProps: { cb: callback1 },
    });

    result.current();
    expect(callback1).toHaveBeenCalledTimes(1);

    rerender({ cb: callback2 });

    result.current();
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledTimes(1);
  });
});
