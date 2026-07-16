-- 1. Create accounts table (if not exists)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    balance NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.1 Add balance column safely if it doesn't exist (in case table was already created)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' 
        AND table_name='accounts' 
        AND column_name='balance'
    ) THEN
        ALTER TABLE public.accounts ADD COLUMN balance NUMERIC NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 1.2 Drop NOT NULL constraint from company_id if it exists (since we don't have active company context yet)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' 
        AND table_name='accounts' 
        AND column_name='company_id'
    ) THEN
        ALTER TABLE public.accounts ALTER COLUMN company_id DROP NOT NULL;
    END IF;
END $$;

-- 1.3 Notify PostgREST to reload schema cache so the API recognizes the new column immediately
NOTIFY pgrst, 'reload schema';

-- 2. Create transactions table (if not exists)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Add missing columns safely if they don't exist
DO $$
BEGIN
    -- account_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' 
        AND table_name='transactions' 
        AND column_name='account_id'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN account_id UUID;
    END IF;

    -- category
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' 
        AND table_name='transactions' 
        AND column_name='category'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN category TEXT NOT NULL DEFAULT 'Other';
    END IF;

    -- description
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' 
        AND table_name='transactions' 
        AND column_name='description'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN description TEXT;
    END IF;

    -- date
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' 
        AND table_name='transactions' 
        AND column_name='date'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
    END IF;

    -- company_id (make nullable if exists)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' 
        AND table_name='transactions' 
        AND column_name='company_id'
    ) THEN
        ALTER TABLE public.transactions ALTER COLUMN company_id DROP NOT NULL;
    END IF;

    -- currency_id (make nullable if exists)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' 
        AND table_name='transactions' 
        AND column_name='currency_id'
    ) THEN
        ALTER TABLE public.transactions ALTER COLUMN currency_id DROP NOT NULL;
    END IF;

    -- transaction_date (set default if exists so frontend doesn't crash)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' 
        AND table_name='transactions' 
        AND column_name='transaction_date'
    ) THEN
        ALTER TABLE public.transactions ALTER COLUMN transaction_date SET DEFAULT now();
    END IF;
END $$;

-- 3.1 Notify PostgREST to reload schema cache so the API recognizes the new columns immediately
NOTIFY pgrst, 'reload schema';

-- 4. Drop constraint if exists to avoid duplication errors, then recreate
DO $$
BEGIN
    ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS fk_transactions_accounts;
EXCEPTION
    WHEN undefined_object THEN
        -- Do nothing if it fails
END $$;

ALTER TABLE public.transactions
    ADD CONSTRAINT fk_transactions_accounts
    FOREIGN KEY (account_id)
    REFERENCES public.accounts (id)
    ON DELETE CASCADE;

