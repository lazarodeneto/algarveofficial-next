-- Promote user lazaro@deneto.ch to administrator
INSERT INTO public.user_roles (user_id, role)
VALUES ('280be9b4-c0fe-48f3-b371-f490d8cccfd5', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;;
