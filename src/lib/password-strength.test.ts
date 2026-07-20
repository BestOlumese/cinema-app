import { describe, expect, it } from "vitest";
import { getPasswordStrength } from "./password-strength";

describe("getPasswordStrength", () => {
  it("scores an empty password as very weak", () => {
    expect(getPasswordStrength("").score).toBe(0);
  });

  it("scores a short, simple password low", () => {
    expect(getPasswordStrength("weak").score).toBeLessThanOrEqual(1);
  });

  it("scores a long password with mixed case, numbers, and symbols as strong", () => {
    expect(getPasswordStrength("StrongPass123!@#").score).toBe(4);
    expect(getPasswordStrength("StrongPass123!@#").label).toBe("Strong");
  });

  it("never returns a score outside 0-4", () => {
    for (const pw of ["", "a", "aaaaaaaaaaaaaaaaaaaa", "Aa1!Aa1!Aa1!Aa1!"]) {
      const { score } = getPasswordStrength(pw);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(4);
    }
  });
});
