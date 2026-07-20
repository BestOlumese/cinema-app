import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Silverbird Cinemas Lekki")).toBe(
      "silverbird-cinemas-lekki",
    );
  });

  it("strips characters outside a-z0-9", () => {
    expect(slugify("Ozone's Cinema & Lounge!")).toBe("ozone-s-cinema-lounge");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --Genesis Cinemas--  ")).toBe("genesis-cinemas");
  });

  it("truncates to 50 characters", () => {
    const long = "a".repeat(80);
    expect(slugify(long).length).toBe(50);
  });
});
