import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
  GolfCourseStructure,
  GolfHoleDataStatus,
  ListingGolfCourseForm,
  ListingGolfFormData,
  ListingGolfHoleForm,
} from "@/types/listing";

interface GolfStepProps {
  golf: ListingGolfFormData;
  validationErrors: Record<string, string>;
  canSave: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
  saveNotice?: {
    type: "success" | "warning";
    text: string;
    savedAt?: string;
  } | null;
  onGolfChange: (next: ListingGolfFormData) => void;
  onSaveChanges: () => void;
  onClearHoles: () => void;
}

type HoleTemplate = "blank" | "par72" | "par3";

const PAR72_TEMPLATE: number[] = [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 5, 3, 4, 4, 5, 3, 4, 4];

function statusConfig(status: GolfHoleDataStatus) {
  if (status === "configured") {
    return {
      label: "Configured",
      className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
    };
  }

  if (status === "incomplete") {
    return {
      label: "Incomplete",
      className: "border-amber-500/40 bg-amber-500/10 text-amber-700",
    };
  }

  return {
    label: "Missing",
    className: "border-border bg-muted text-muted-foreground",
  };
}

function toNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInputString(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  return String(value);
}

function createHole(holeNumber: number): ListingGolfHoleForm {
  return {
    hole_number: holeNumber,
    par: 4,
    stroke_index: holeNumber,
    distance_white: null,
    distance_yellow: null,
    distance_red: null,
  };
}

function ensureHoleCount(holes: ListingGolfHoleForm[], holesCount: number): ListingGolfHoleForm[] {
  const byHoleNumber = new Map(holes.map((hole) => [hole.hole_number, hole]));
  return Array.from({ length: holesCount }, (_, index) => {
    const holeNumber = index + 1;
    return byHoleNumber.get(holeNumber) ?? createHole(holeNumber);
  });
}

function applyTemplate(holesCount: number, template: HoleTemplate): ListingGolfHoleForm[] {
  const normalizedCount = Math.max(1, Math.min(holesCount, 18));

  return Array.from({ length: normalizedCount }, (_, index) => {
    const holeNumber = index + 1;
    const base = createHole(holeNumber);

    if (template === "blank") {
      return base;
    }

    if (template === "par3") {
      return {
        ...base,
        par: 3,
      };
    }

    const par = PAR72_TEMPLATE[index] ?? 4;
    return {
      ...base,
      par,
    };
  });
}

function normalizeCoursesForStructure(
  structure: GolfCourseStructure,
  courses: ListingGolfCourseForm[],
): ListingGolfCourseForm[] {
  if (structure === "multi") {
    if (courses.length > 0) return courses;
    return [
      {
        id: `course-${Date.now()}`,
        name: "North Course",
        holes_count: 18,
        is_default: true,
        holes: ensureHoleCount([], 18),
      },
      {
        id: `course-${Date.now() + 1}`,
        name: "South Course",
        holes_count: 18,
        is_default: false,
        holes: ensureHoleCount([], 18),
      },
    ];
  }

  const first = courses[0] ?? {
    id: `course-${Date.now()}`,
    name: "Main Course",
    holes_count: structure === "custom" ? 12 : 18,
    is_default: true,
    holes: ensureHoleCount([], structure === "custom" ? 12 : 18),
  };

  const cappedHoleCount = structure === "custom"
    ? Math.min(Math.max(first.holes_count, 6), 18)
    : first.holes_count > 18
      ? 18
      : Math.max(first.holes_count, 9);

  return [
    {
      ...first,
      holes_count: cappedHoleCount,
      is_default: true,
      holes: ensureHoleCount(first.holes, cappedHoleCount),
    },
  ];
}

interface NumericFieldProps {
  id: string;
  value: number | null | undefined;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  error?: boolean;
  onChange: (value: number | null) => void;
  className?: string;
}

function NumericField({
  id,
  value,
  min,
  max,
  step,
  disabled,
  error,
  onChange,
  className,
}: NumericFieldProps) {
  return (
    <Input
      id={id}
      type="number"
      value={toInputString(value)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={(event) => onChange(toNullableNumber(event.target.value))}
      className={cn(
        "h-9 rounded-md border border-border/80 bg-white/80 text-center text-sm backdrop-blur focus-visible:ring-2 focus-visible:ring-emerald-500",
        error && "border-rose-400 bg-rose-50",
        className,
      )}
    />
  );
}

export function GolfStep({
  golf,
  validationErrors,
  canSave,
  isLoading = false,
  isSaving = false,
  saveNotice = null,
  onGolfChange,
  onSaveChanges,
  onClearHoles,
}: GolfStepProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(golf.courses[0]?.id ?? "");

  useEffect(() => {
    if (!golf.courses.length) {
      setSelectedCourseId("");
      return;
    }

    const hasSelectedCourse = golf.courses.some((course) => course.id === selectedCourseId);
    if (!hasSelectedCourse) {
      setSelectedCourseId(golf.courses[0].id);
    }
  }, [golf.courses, selectedCourseId]);

  const selectedCourse = useMemo(
    () => golf.courses.find((course) => course.id === selectedCourseId) ?? golf.courses[0] ?? null,
    [golf.courses, selectedCourseId],
  );

  const statusMeta = statusConfig(golf.status);
  const isDisabled = isSaving;

  const updateCourses = (nextCourses: ListingGolfCourseForm[]) => {
    onGolfChange({
      ...golf,
      courses: nextCourses,
    });
  };

  const updateCourse = (
    courseId: string,
    updater: (course: ListingGolfCourseForm) => ListingGolfCourseForm,
  ) => {
    updateCourses(
      golf.courses.map((course) => (course.id === courseId ? updater(course) : course)),
    );
  };

  const handleStructureChange = (structure: GolfCourseStructure) => {
    const normalized = normalizeCoursesForStructure(structure, golf.courses);

    onGolfChange({
      ...golf,
      structure,
      details: {
        ...golf.details,
        holes_count: structure === "multi" ? null : normalized[0]?.holes_count ?? 18,
      },
      courses: normalized,
    });

    if (normalized[0]) {
      setSelectedCourseId(normalized[0].id);
    }
  };

  const handleAddCourse = () => {
    const newCourseId = `course-${Date.now()}`;
    const nextCourses = [
      ...golf.courses,
      {
        id: newCourseId,
        name: `Course ${golf.courses.length + 1}`,
        holes_count: 18,
        is_default: golf.courses.length === 0,
        holes: ensureHoleCount([], 18),
      },
    ];
    updateCourses(nextCourses);
    setSelectedCourseId(newCourseId);
  };

  const handleRemoveCourse = (courseId: string) => {
    if (golf.courses.length <= 1) return;
    const remaining = golf.courses.filter((course) => course.id !== courseId);
    const hasDefault = remaining.some((course) => course.is_default);
    const normalized = hasDefault
      ? remaining
      : remaining.map((course, index) => ({
          ...course,
          is_default: index === 0,
        }));

    updateCourses(normalized);
    if (selectedCourseId === courseId) {
      setSelectedCourseId(normalized[0]?.id ?? "");
    }
  };

  const handleSetDefaultCourse = (courseId: string) => {
    updateCourses(
      golf.courses.map((course) => ({
        ...course,
        is_default: course.id === courseId,
      })),
    );
  };

  const handleCourseHoleCountChange = (courseId: string, holesCount: number) => {
    const normalizedCount = golf.structure === "custom"
      ? Math.min(Math.max(holesCount, 6), 18)
      : Math.min(Math.max(holesCount, 9), 18);

    const nextCourses = golf.courses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            holes_count: normalizedCount,
            holes: ensureHoleCount(course.holes, normalizedCount),
          }
        : course,
    );

    onGolfChange({
      ...golf,
      details: {
        ...golf.details,
        holes_count: golf.structure === "multi" ? golf.details.holes_count : normalizedCount,
      },
      courses: nextCourses,
    });
  };

  const handleApplyTemplate = (courseId: string, template: HoleTemplate) => {
    const course = golf.courses.find((entry) => entry.id === courseId);
    if (!course) return;

    const holes = applyTemplate(course.holes_count, template);
    updateCourse(courseId, (entry) => ({
      ...entry,
      holes,
    }));
  };

  const handleGenerate18 = (courseId: string) => {
    const generated = applyTemplate(18, "blank");
    const nextCourses = golf.courses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            holes_count: 18,
            holes: generated,
          }
        : course,
    );

    onGolfChange({
      ...golf,
      details: {
        ...golf.details,
        holes_count: golf.structure === "multi" ? golf.details.holes_count : 18,
      },
      courses: nextCourses,
    });
  };

  const handleHoleChange = (
    courseId: string,
    holeNumber: number,
    field: keyof ListingGolfHoleForm,
    value: number | null,
  ) => {
    updateCourse(courseId, (course) => ({
      ...course,
      holes: course.holes.map((hole) => {
        if (hole.hole_number !== holeNumber) return hole;

        if (field === "hole_number") {
          if (typeof value !== "number" || !Number.isInteger(value)) return hole;
          return {
            ...hole,
            hole_number: value,
          };
        }

        return {
          ...hole,
          [field]: value,
        };
      }),
    }));
  };

  useEffect(() => {
    if (!selectedCourse || isLoading || isSaving) return;
    if (selectedCourse.holes.length > 0) return;

    const nextCourses = golf.courses.map((course) =>
      course.id === selectedCourse.id
        ? {
            ...course,
            holes: ensureHoleCount(course.holes, course.holes_count),
          }
        : course,
    );

    onGolfChange({
      ...golf,
      courses: nextCourses,
    });
  }, [
    golf,
    isLoading,
    isSaving,
    onGolfChange,
    selectedCourse,
  ]);

  return (
    <section className="relative space-y-5 rounded-2xl border border-white/30 bg-white/60 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C7A35A] to-transparent" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Golf Course Setup</h3>
          <p className="text-sm text-muted-foreground">
            Configure course structure and hole-by-hole data for scorecards and rounds.
          </p>
        </div>
        <Badge variant="outline" className={statusMeta.className}>
          {statusMeta.label}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label>Course Structure</Label>
        <div className="flex flex-wrap gap-2">
          {([
            { key: "single", label: "Single Course" },
            { key: "multi", label: "Multi-Course Resort" },
            { key: "custom", label: "Custom Layout" },
          ] as const).map((option) => (
            <Button
              key={option.key}
              type="button"
              variant={golf.structure === option.key ? "default" : "outline"}
              size="sm"
              disabled={isDisabled}
              onClick={() => handleStructureChange(option.key)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {golf.structure === "multi" ? (
          <Button type="button" variant="outline" size="sm" disabled={isDisabled} onClick={handleAddCourse}>
            Add course
          </Button>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isDisabled || !selectedCourse}
          onClick={() => selectedCourse && handleGenerate18(selectedCourse.id)}
        >
          Generate 18 holes
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isDisabled || !selectedCourse}
          onClick={() => selectedCourse && handleApplyTemplate(selectedCourse.id, "par72")}
        >
          Par 72 template
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isDisabled || !selectedCourse}
          onClick={() => selectedCourse && handleApplyTemplate(selectedCourse.id, "par3")}
        >
          Par 3 template
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isDisabled}
          onClick={onClearHoles}
          className="border-rose-300 text-rose-700 hover:bg-rose-50"
        >
          Clear holes
        </Button>

        <div className="ml-auto">
          <Button type="button" size="sm" disabled={isDisabled || !canSave} onClick={onSaveChanges}>
            Save changes
          </Button>
        </div>
      </div>

      {!canSave ? (
        <p className="rounded-lg border border-amber-300/50 bg-amber-50/70 px-3 py-2 text-xs text-amber-700">
          Save the listing once before configuring course data.
        </p>
      ) : null}

      {saveNotice ? (
        <p
          className={cn(
            "rounded-lg border px-3 py-2 text-xs",
            saveNotice.type === "success"
              ? "border-emerald-300/60 bg-emerald-50/80 text-emerald-800"
              : "border-amber-300/60 bg-amber-50/80 text-amber-800",
          )}
        >
          <span>{saveNotice.text}</span>
          {saveNotice.savedAt ? (
            <span className="ml-2 font-medium">Saved at {saveNotice.savedAt}</span>
          ) : null}
        </p>
      ) : null}

      {golf.structure !== "multi" && selectedCourse && selectedCourse.holes_count > 18 ? (
        <p className="rounded-lg border border-rose-300/50 bg-rose-50/70 px-3 py-2 text-xs text-rose-700">
          Hole counts above 18 require Multi-Course Resort mode.
        </p>
      ) : null}

      <div className="space-y-4 rounded-xl border border-border/70 bg-white/75 p-4">
        <div className="flex flex-wrap gap-2">
          {golf.courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedCourseId(course.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                selectedCourseId === course.id
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-border bg-white text-foreground hover:bg-muted",
              )}
              disabled={isDisabled}
            >
              {course.name}
            </button>
          ))}
        </div>

        {selectedCourse ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="golf-course-name">Course Name</Label>
              <Input
                id="golf-course-name"
                value={selectedCourse.name}
                disabled={isDisabled}
                onChange={(event) =>
                  updateCourse(selectedCourse.id, (course) => ({
                    ...course,
                    name: event.target.value,
                  }))
                }
                className="h-9 rounded-md border border-border/80 bg-white/80 backdrop-blur"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="golf-course-holes-count">Holes Count</Label>
              <NumericField
                id="golf-course-holes-count"
                value={selectedCourse.holes_count}
                min={golf.structure === "custom" ? 6 : 9}
                max={18}
                step={1}
                disabled={isDisabled}
                error={Boolean(validationErrors[`course.${selectedCourse.id}.holes_count`])}
                onChange={(value) => {
                  if (typeof value !== "number" || !Number.isInteger(value)) return;
                  handleCourseHoleCountChange(selectedCourse.id, value);
                }}
              />
            </div>

            {golf.structure !== "multi" ? (
              <div className="sm:col-span-3 flex flex-wrap gap-2">
                {(golf.structure === "custom" ? [6, 9, 12, 18] : [9, 18]).map((preset) => (
                  <Button
                    key={`preset-${preset}`}
                    type="button"
                    variant={selectedCourse.holes_count === preset ? "default" : "outline"}
                    size="sm"
                    disabled={isDisabled}
                    onClick={() => handleCourseHoleCountChange(selectedCourse.id, preset)}
                  >
                    {preset} holes
                  </Button>
                ))}
              </div>
            ) : null}

            {golf.structure === "multi" ? (
              <div className="sm:col-span-3 flex items-center gap-2">
                <Button
                  type="button"
                  variant={selectedCourse.is_default ? "default" : "outline"}
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => handleSetDefaultCourse(selectedCourse.id)}
                >
                  {selectedCourse.is_default ? "Default Course" : "Set as default"}
                </Button>
                {golf.courses.length > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-rose-300 text-rose-700 hover:bg-rose-50"
                    disabled={isDisabled}
                    onClick={() => handleRemoveCourse(selectedCourse.id)}
                  >
                    Remove course
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="golf-architect">Architect</Label>
          <Input
            id="golf-architect"
            value={golf.details.architect}
            disabled={isDisabled}
            onChange={(event) =>
              onGolfChange({
                ...golf,
                details: { ...golf.details, architect: event.target.value },
              })
            }
            className="h-9 rounded-md border border-border/80 bg-white/80 backdrop-blur"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="golf-course-rating">Course Rating</Label>
          <NumericField
            id="golf-course-rating"
            value={golf.details.course_rating}
            min={0}
            step={0.1}
            disabled={isDisabled}
            onChange={(value) =>
              onGolfChange({
                ...golf,
                details: { ...golf.details, course_rating: value },
              })
            }
            className="text-left"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="golf-slope-rating">Slope Rating</Label>
          <NumericField
            id="golf-slope-rating"
            value={golf.details.slope_rating}
            min={0}
            step={1}
            disabled={isDisabled}
            onChange={(value) =>
              onGolfChange({
                ...golf,
                details: { ...golf.details, slope_rating: value },
              })
            }
            className="text-left"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="golf-booking-url">Booking URL</Label>
          <Input
            id="golf-booking-url"
            value={golf.details.booking_url}
            disabled={isDisabled}
            onChange={(event) =>
              onGolfChange({
                ...golf,
                details: { ...golf.details, booking_url: event.target.value },
              })
            }
            className="h-9 rounded-md border border-border/80 bg-white/80 backdrop-blur"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="golf-scorecard-image-url">Scorecard Image URL</Label>
          <Input
            id="golf-scorecard-image-url"
            value={golf.details.scorecard_image_url}
            disabled={isDisabled}
            onChange={(event) =>
              onGolfChange({
                ...golf,
                details: { ...golf.details, scorecard_image_url: event.target.value },
              })
            }
            className="h-9 rounded-md border border-border/80 bg-white/80 backdrop-blur"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="golf-scorecard-pdf-url">Scorecard PDF URL</Label>
          <Input
            id="golf-scorecard-pdf-url"
            value={golf.details.scorecard_pdf_url}
            disabled={isDisabled}
            onChange={(event) =>
              onGolfChange({
                ...golf,
                details: { ...golf.details, scorecard_pdf_url: event.target.value },
              })
            }
            className="h-9 rounded-md border border-border/80 bg-white/80 backdrop-blur"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="golf-map-image-url">Map Image URL</Label>
          <Input
            id="golf-map-image-url"
            value={golf.details.map_image_url}
            disabled={isDisabled}
            onChange={(event) =>
              onGolfChange({
                ...golf,
                details: { ...golf.details, map_image_url: event.target.value },
              })
            }
            className="h-9 rounded-md border border-border/80 bg-white/80 backdrop-blur"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/70 bg-white/80">
        <div className="max-h-[540px] min-w-[760px] overflow-y-auto">
          <div className="sticky top-0 z-10 grid grid-cols-[60px_60px_70px_repeat(3,minmax(120px,1fr))] border-b border-border bg-muted/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground backdrop-blur">
            <div>Hole</div>
            <div>Par</div>
            <div>S.I.</div>
            <div>White</div>
            <div>Yellow</div>
            <div>Red</div>
          </div>

          {isLoading ? (
            <div className="px-4 py-8 text-sm text-muted-foreground">Loading hole data…</div>
          ) : !selectedCourse ? (
            <div className="px-4 py-8 text-sm text-muted-foreground">Add a course to begin.</div>
          ) : selectedCourse.holes.length === 0 ? (
            <div className="px-4 py-8 text-sm text-muted-foreground">
              No holes configured for this course yet.
            </div>
          ) : (
            [...selectedCourse.holes]
              .sort((a, b) => a.hole_number - b.hole_number)
              .map((hole, index) => {
                const rowStripe = index % 2 === 0 ? "bg-white" : "bg-muted/25";
                const errorPrefix = `course.${selectedCourse.id}.hole.${hole.hole_number}`;

                return (
                  <div
                    key={`hole-row-${selectedCourse.id}-${hole.hole_number}-${index}`}
                    className={cn(
                      "grid grid-cols-[60px_60px_70px_repeat(3,minmax(120px,1fr))] items-center gap-2 border-t border-border/60 px-3 py-2",
                      rowStripe,
                    )}
                  >
                    <NumericField
                      id={`hole-${selectedCourse.id}-${index}-number`}
                      value={hole.hole_number}
                      min={1}
                      max={18}
                      step={1}
                      disabled={isDisabled}
                      error={Boolean(validationErrors[`${errorPrefix}.hole_number`])}
                      onChange={(value) =>
                        handleHoleChange(selectedCourse.id, hole.hole_number, "hole_number", value)
                      }
                      className="font-medium"
                    />

                    <NumericField
                      id={`hole-${selectedCourse.id}-${index}-par`}
                      value={hole.par}
                      min={1}
                      max={7}
                      step={1}
                      disabled={isDisabled}
                      error={Boolean(validationErrors[`${errorPrefix}.par`])}
                      onChange={(value) =>
                        handleHoleChange(selectedCourse.id, hole.hole_number, "par", value)
                      }
                    />

                    <NumericField
                      id={`hole-${selectedCourse.id}-${index}-si`}
                      value={hole.stroke_index}
                      min={1}
                      max={18}
                      step={1}
                      disabled={isDisabled}
                      error={Boolean(validationErrors[`${errorPrefix}.stroke_index`])}
                      onChange={(value) =>
                        handleHoleChange(selectedCourse.id, hole.hole_number, "stroke_index", value)
                      }
                    />

                    <NumericField
                      id={`hole-${selectedCourse.id}-${index}-white`}
                      value={hole.distance_white}
                      min={0}
                      step={1}
                      disabled={isDisabled}
                      error={Boolean(validationErrors[`${errorPrefix}.distance_white`])}
                      onChange={(value) =>
                        handleHoleChange(selectedCourse.id, hole.hole_number, "distance_white", value)
                      }
                    />

                    <NumericField
                      id={`hole-${selectedCourse.id}-${index}-yellow`}
                      value={hole.distance_yellow}
                      min={0}
                      step={1}
                      disabled={isDisabled}
                      error={Boolean(validationErrors[`${errorPrefix}.distance_yellow`])}
                      onChange={(value) =>
                        handleHoleChange(selectedCourse.id, hole.hole_number, "distance_yellow", value)
                      }
                    />

                    <NumericField
                      id={`hole-${selectedCourse.id}-${index}-red`}
                      value={hole.distance_red}
                      min={0}
                      step={1}
                      disabled={isDisabled}
                      error={Boolean(validationErrors[`${errorPrefix}.distance_red`])}
                      onChange={(value) =>
                        handleHoleChange(selectedCourse.id, hole.hole_number, "distance_red", value)
                      }
                    />
                  </div>
                );
              })
          )}
        </div>
      </div>
    </section>
  );
}
