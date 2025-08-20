import * as mainExports from "../index";
import * as hookExports from "../hooks";
import * as utilExports from "../lib/utils";

describe("Main index exports", () => {
  it("should export all hooks", () => {
    expect(mainExports.useActionMutation).toBeDefined();
    expect(mainExports.useActionMutation).toBe(hookExports.useActionMutation);
  });

  it("should export all utilities", () => {
    expect(mainExports.envelopeServerAction).toBeDefined();
    expect(mainExports.envelopeServerAction).toBe(
      utilExports.envelopeServerAction
    );
  });

  it("should have consistent exports with individual modules", () => {
    const mainKeys = Object.keys(mainExports);
    const hookKeys = Object.keys(hookExports);
    const utilKeys = Object.keys(utilExports);

    hookKeys.forEach((key) => {
      expect(mainKeys).toContain(key);
    });

    utilKeys.forEach((key) => {
      expect(mainKeys).toContain(key);
    });
  });
});
