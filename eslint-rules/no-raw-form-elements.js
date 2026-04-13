/**
 * eslint-rules/no-raw-form-elements.js
 *
 * Forbid raw <input>, <select>, <textarea> in admin components.
 * Enforce use of controlled form primitives:
 * - TextField, TextareaField
 * - NumberField
 * - SelectField
 * - SwitchField
 *
 * ❌ Forbidden in admin components:
 *   <input ... /> (except type="file", type="hidden")
 *   <select ...>...</select>
 *   <textarea ... />
 *
 * ✅ Required:
 *   <TextField field={...} />
 *   <NumberField value={...} onValueChange={...} />
 *   <SelectField value={...} onValueChange={...} />
 *   <SwitchField checked={...} onCheckedChange={...} />
 *
 * Exception: Components in components/ui/, and file/hidden inputs.
 */

"use strict";

const PRIMITIVES = [
  "TextField",
  "TextareaField",
  "NumberField",
  "SelectField",
  "SwitchField",
  "TextFieldProps",
  "TextareaFieldProps",
  "NumberFieldProps",
  "SelectFieldProps",
  "SwitchFieldProps",
];

const RAW_ELEMENTS = ["input", "select", "textarea"];

const ALLOWED_PATHS = [
  "components/ui/input.tsx",
  "components/ui/select.tsx",
  "components/ui/textarea.tsx",
  "components/ui/form/TextField.tsx",
  "components/ui/form/TextareaField.tsx",
  "components/ui/form/NumberField.tsx",
  "components/ui/form/SelectField.tsx",
  "components/ui/form/SwitchField.tsx",
];

const ALLOWED_TYPES = ["file", "hidden", "submit", "reset", "button", "image"];

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Forbid raw form elements in admin - use controlled primitives instead",
    },
    schema: [],
    messages: {
      usePrimitive:
        "Use form primitive ({primitive}) instead of raw <{element}>. Found in: {path}",
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();

    const isAllowedPath = ALLOWED_PATHS.some((p) => filename.includes(p));
    if (isAllowedPath) return {};

    const isAdminComponent =
      filename.includes("/admin/") || filename.includes("/form-steps/");
    if (!isAdminComponent) return {};

    return {
      JSXOpeningElement(node) {
        const elementName = node.name.name;

        if (!RAW_ELEMENTS.includes(elementName)) return;

        const typeAttr = node.attributes.find(
          (attr) => attr.name && attr.name.value === "type",
        );
        const typeValue = typeAttr?.value?.value;

        if (typeValue && ALLOWED_TYPES.includes(typeValue)) return;

        context.report({
          node,
          messageId: "usePrimitive",
          data: {
            primitive: PRIMITIVES.join(" | "),
            element: elementName,
            path: filename,
          },
        });
      },
    };
  },
};