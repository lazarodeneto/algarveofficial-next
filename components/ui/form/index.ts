/**
 * components/ui/form/index.ts
 *
 * Barrel export for form primitive components.
 * Import from "@/components/ui/form" (the subdirectory), not from
 * "@/components/ui/form.tsx" (the shadcn FormProvider file).
 *
 * Usage:
 *   import { TextField, TextareaField, NumberField, SelectField, SwitchField }
 *     from "@/components/ui/form";
 */

export { TextField, TextareaField }  from "./TextField";
export { NumberField }               from "./NumberField";
export { SelectField }               from "./SelectField";
export { SwitchField }               from "./SwitchField";
