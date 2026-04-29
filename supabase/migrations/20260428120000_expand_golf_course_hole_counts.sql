-- Expand golf course setup beyond 18 holes for multi-course resorts.
-- Round score entry still validates 18-hole play separately in application code.

ALTER TABLE public.golf_holes
  DROP CONSTRAINT IF EXISTS golf_holes_hole_number_check,
  ADD CONSTRAINT golf_holes_hole_number_check
    CHECK (hole_number BETWEEN 1 AND 54);

ALTER TABLE public.golf_holes
  DROP CONSTRAINT IF EXISTS golf_holes_stroke_index_check,
  ADD CONSTRAINT golf_holes_stroke_index_check
    CHECK (stroke_index IS NULL OR stroke_index BETWEEN 1 AND 54);
