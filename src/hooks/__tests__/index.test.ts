import * as hookExports from "../index";
import { useActionMutation } from "../use-action-mutation";

describe("Hooks index exports", () => {
  it("should export useActionMutation", () => {
    expect(hookExports.useActionMutation).toBeDefined();
    expect(hookExports.useActionMutation).toBe(useActionMutation);
  });

  it("should export all expected hooks", () => {
    const exportKeys = Object.keys(hookExports);
    expect(exportKeys).toContain("useActionMutation");

    exportKeys.forEach((key) => {
      expect(typeof hookExports[key as keyof typeof hookExports]).toBe(
        "function"
      );
    });
  });
});
