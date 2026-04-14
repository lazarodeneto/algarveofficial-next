-- Allow new target languages in translation_jobs
ALTER TABLE public.translation_jobs
DROP CONSTRAINT IF EXISTS translation_jobs_target_lang_check;
ALTER TABLE public.translation_jobs
ADD CONSTRAINT translation_jobs_target_lang_check
CHECK (target_lang = ANY (ARRAY['pt-pt','fr','de','es','it','nl','sv','no','da']));
