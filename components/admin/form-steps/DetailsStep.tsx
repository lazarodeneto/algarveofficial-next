import { DynamicFormField } from "../listings/DynamicFormField";
import { getCategoryTemplate } from "@/lib/categoryTemplates";
import { AlertCircle } from "lucide-react";
import type { ListingFormData } from "@/types/listing";

interface CategoryRef {
  id: string;
  slug: string;
  name: string;
}

interface DetailsStepProps {
  data: ListingFormData;
  onChange: (field: keyof ListingFormData, value: unknown) => void;
  errors: Record<string, string>;
  categoryId: string;
  categories: CategoryRef[];
}

export function DetailsStep({ data, onChange, errors, categoryId, categories }: DetailsStepProps) {
  // Resolve category slug from UUID
  const category = categories.find(c => c.id === categoryId);
  const categorySlug = category?.slug ?? '';
  const template = getCategoryTemplate(categorySlug);

  const handleDetailChange = (fieldName: string, value: unknown) => {
    onChange("details", {
      ...data.details,
      [fieldName]: value,
    });
  };

  if (!categoryId) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold font-serif">Category Details</h3>
          <p className="text-sm text-muted-foreground">
            Category-specific information for this listing
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Please select a category first
            </p>
            <p className="text-xs text-muted-foreground">
              Go back to the Basics step and select a category to see the relevant fields.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold font-serif">Category Details</h3>
          <p className="text-sm text-muted-foreground">
            Category-specific information for this listing
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Template not found
            </p>
            <p className="text-xs text-muted-foreground">
              No template is configured for this category. Contact admin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group fields: required first, then optional
  const requiredFields = template.fields.filter((f) => f.required);
  const optionalFields = template.fields.filter((f) => !f.required);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold font-serif">{template.name} Details</h3>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>

      {/* Required fields */}
      {requiredFields.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Required Information
          </h4>
          <div className="grid gap-6 sm:grid-cols-2">
            {requiredFields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === "multiselect" || field.type === "tags"
                    ? "sm:col-span-2"
                    : ""
                }
              >
                <DynamicFormField
                  field={field}
                  value={data.details?.[field.name]}
                  onChange={(value) => handleDetailChange(field.name, value)}
                  error={errors[`details.${field.name}`]}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional fields */}
      {optionalFields.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Additional Information (Optional)
          </h4>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {optionalFields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === "multiselect" || field.type === "tags"
                    ? "sm:col-span-2 lg:col-span-3"
                    : ""
                }
              >
                <DynamicFormField
                  field={field}
                  value={data.details?.[field.name]}
                  onChange={(value) => handleDetailChange(field.name, value)}
                  error={errors[`details.${field.name}`]}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
