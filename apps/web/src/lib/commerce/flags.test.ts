import {describe, expect, it, beforeEach, afterEach} from "vitest";
import {commerceFlags, medusaBackendUrl} from "./flags";

describe("commerce flags", () => {
  const prev = {...process.env};

  beforeEach(() => {
    process.env = {...prev};
  });

  afterEach(() => {
    process.env = prev;
  });

  it("defaults to legacy backend", () => {
    delete process.env.COMMERCE_BACKEND;
    expect(commerceFlags.backend()).toBe("legacy");
  });

  it("parses medusa catalog read flag", () => {
    process.env.MEDUSA_CATALOG_READ = "true";
    expect(commerceFlags.medusaCatalogRead()).toBe(true);
  });

  it("validates medusa backend url", () => {
    process.env.MEDUSA_BACKEND_URL = "https://medusa.example.com/";
    expect(medusaBackendUrl()).toBe("https://medusa.example.com");
  });
});