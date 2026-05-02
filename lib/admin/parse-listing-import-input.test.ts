import { describe, expect, it } from "vitest";

import { parseListingImportInput } from "./parse-listing-import-input";

describe("parseListingImportInput", () => {
  it("normalizes a single JSON object to one listing", () => {
    const result = parseListingImportInput('{"Nome":"Single Listing","City":"Lagos"}');

    expect(result.error).toBeNull();
    expect(result.listings).toEqual([{ Nome: "Single Listing", City: "Lagos" }]);
  });

  it("preserves JSON array input", () => {
    const result = parseListingImportInput('[{"Nome":"One"},{"Nome":"Two"}]');

    expect(result.error).toBeNull();
    expect(result.listings).toEqual([{ Nome: "One" }, { Nome: "Two" }]);
  });

  it("rejects primitives and null with a clear message", () => {
    expect(parseListingImportInput("null").error).toBe("JSON must be an object or an array of objects.");
    expect(parseListingImportInput('"listing"').error).toBe("JSON must be an object or an array of objects.");
  });

  it("reports invalid JSON", () => {
    expect(parseListingImportInput("{").error).toBe("Invalid JSON format");
  });
});
