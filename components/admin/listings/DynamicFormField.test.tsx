import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DynamicFormField } from "./DynamicFormField";
import type { CategoryFieldConfig } from "@/lib/categoryTemplates";

vi.mock("./SingleImageUploadField", () => ({
  SingleImageUploadField: () => <div data-testid="single-image-upload-field" />,
}));

describe("DynamicFormField collection values", () => {
  it("renders tags fields safely when stored category data is not an array", () => {
    const field: CategoryFieldConfig = {
      name: "features",
      label: "Features & Amenities",
      type: "tags",
      required: false,
      placeholder: "Add features...",
    };

    expect(() =>
      render(
        <DynamicFormField
          field={field}
          value={{ highlights: ["Infinity pool", "Sea view"] }}
          onChange={vi.fn()}
        />,
      ),
    ).not.toThrow();

    expect(screen.getByText("Infinity pool")).toBeInTheDocument();
    expect(screen.getByText("Sea view")).toBeInTheDocument();
  });

  it("renders multiselect fields safely when stored category data is not an array", () => {
    const field: CategoryFieldConfig = {
      name: "amenities",
      label: "Amenities",
      type: "multiselect",
      required: false,
      options: [
        { value: "pool", label: "Pool" },
        { value: "spa", label: "Spa" },
      ],
    };

    expect(() =>
      render(
        <DynamicFormField
          field={field}
          value={{ pool: true }}
          onChange={vi.fn()}
        />,
      ),
    ).not.toThrow();

    expect(screen.getByText("Click options below to select...")).toBeInTheDocument();
    expect(screen.getByText("+ Pool")).toBeInTheDocument();
  });
});
