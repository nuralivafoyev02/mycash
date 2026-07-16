-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'income', 'expense', 'counterparty'
    inn TEXT, -- INN for counterparties
    phone TEXT, -- Phone number for counterparties
    description TEXT, -- Description/notes
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely add columns if they don't exist (in case table was already created)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' 
        AND table_name='categories' 
        AND column_name='inn'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN inn TEXT;
        ALTER TABLE public.categories ADD COLUMN phone TEXT;
        ALTER TABLE public.categories ADD COLUMN description TEXT;
    END IF;
END $$;

-- Disable RLS to match accounts and transactions for now
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Safely drop NOT NULL constraint on company_id since we don't have company context yet
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' 
        AND table_name='categories' 
        AND column_name='company_id'
    ) THEN
        ALTER TABLE public.categories ALTER COLUMN company_id DROP NOT NULL;
    END IF;
END $$;

-- Drop any existing policies if they were created
DROP POLICY IF EXISTS "Users can view their company categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert categories for their company" ON public.categories;
DROP POLICY IF EXISTS "Users can update their company categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their company categories" ON public.categories;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
