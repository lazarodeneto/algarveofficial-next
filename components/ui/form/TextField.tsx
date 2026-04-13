/**
 * components/ui/form/TextField.tsx
 *
 * Controlled text / textarea field with label, hint, and error display.
 * Enforces the nullish-coalescing contract: value is ALWAYS a string
 * (never null | undefined) so React never flips between controlled/uncontrolled.
 *
 * Usage with react-hook-form:
 *   <FormField control={form.control} name="name" render={({ field }) => (
 *     <TextField label="Name" field={field} required />
 *   )} />
 *
 * Usage standalone:
 *   <TextField label="Name" field={{ value: name, onChange: setName, onBlur, name: "name", ref }} />
 */

import * as React from "react";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label }    from "@/components/ui/label";
import { cn }       from "@/lib/utils";

interface BaseFieldProps {
  /** Display label */
  label:       string;
  /** Show required asterisk */
  required?:   boolean;
  /** Helper text shown below the field */
  hint?:       string;
  /** Validation error message */
  error?:      string;
  /** Extra class on the wrapper div */
  className?:  string;
  /** Character limit — shows a counter */
  maxLength?:  number;
  disabled?:   boolean;
  placeholder?: string;
  id?:         string;
}

// Minimal subset of ControllerRenderProps that we actually need
interface FieldLike {
  name:     string;
  value:    string | null | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?:  () => void;
  ref?:     React.Ref<HTMLInputElement | HTMLTextAreaElement>;
}

// ─── TextField (single-line input) ───────────────────────────────────────────

export interface TextFieldProps extends BaseFieldProps {
  field:   FieldLike;
  type?:   "text" | "email" | "tel" | "url" | "password" | "search";
}

export function TextField({
  field,
  label,
  required,
  hint,
  error,
  className,
  maxLength,
  disabled,
  placeholder,
  id,
  type = "text",
}: TextFieldProps) {
  const fieldId    = id ?? field.name;
  // ↓ THE critical rule: controlled inputs must never receive null/undefined
  const safeValue  = field.value ?? "";
  const charCount  = safeValue.length;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={fieldId}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        {maxLength !== undefined && (
          <span
            className={cn(
              "text-xs tabular-nums",
              charCount > maxLength ? "text-amber-500" : "text-muted-foreground",
            )}
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>

      <Input
        id={fieldId}
        name={field.name}
        type={type}
        value={safeValue}
        onChange={field.onChange}
        onBlur={field.onBlur}
        ref={field.ref as React.Ref<HTMLInputElement>}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={cn(error && "border-destructive")}
      />

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

// ─── TextareaField (multiline) ────────────────────────────────────────────────

export interface TextareaFieldProps extends BaseFieldProps {
  field: FieldLike;
  rows?: number;
}

export function TextareaField({
  field,
  label,
  required,
  hint,
  error,
  className,
  maxLength,
  disabled,
  placeholder,
  id,
  rows = 3,
}: TextareaFieldProps) {
  const fieldId   = id ?? field.name;
  const safeValue = field.value ?? "";
  const charCount = safeValue.length;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={fieldId}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        {maxLength !== undefined && (
          <span
            className={cn(
              "text-xs tabular-nums",
              charCount > maxLength ? "text-amber-500" : "text-muted-foreground",
            )}
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>

      <Textarea
        id={fieldId}
        name={field.name}
        value={safeValue}
        onChange={field.onChange}
        onBlur={field.onBlur}
        ref={field.ref as React.Ref<HTMLTextAreaElement>}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        className={cn(error && "border-destructive")}
      />

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
