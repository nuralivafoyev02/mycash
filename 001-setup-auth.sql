-- 1. Parollar va Rollarni saqlash uchun yangi ustunlar qo'shamiz (agar mavjud bo'lmasa)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'User';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Super Admin akkauntini yaratamiz
INSERT INTO public.users (auth_id, full_name, email, role, password_hash)
VALUES (
    gen_random_uuid(),
    'Super Admin',
    'admin@mycash.com',
    'Admin',
    crypt('superadmin123', gen_salt('bf'))
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = crypt('superadmin123', gen_salt('bf')), role = 'Admin';
