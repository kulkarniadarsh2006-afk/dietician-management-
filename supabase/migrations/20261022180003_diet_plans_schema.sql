-- ==============================================================================
-- Migration: 20261022180003_diet_plans_schema.sql
-- Description: Diet plans table, strict storage path convention, PDF-only MIME
--              and size constraints, and race-free transactional versioning.
-- ==============================================================================

-- 1. Diet Plans table
CREATE TABLE IF NOT EXISTS public.diet_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,

  -- Storage path strictly follows: clients/{client_uuid}/{diet_plan_uuid}.pdf
  -- Never uses original filename in path to prevent path traversal or special character issues.
  storage_path text NOT NULL UNIQUE,
  CONSTRAINT chk_diet_plan_storage_path CHECK (
    storage_path ~ '^clients/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$'
  ),

  -- File metadata
  original_filename text NOT NULL CHECK (length(trim(original_filename)) > 0),
  mime_type text NOT NULL CHECK (mime_type = 'application/pdf'),
  file_size_bytes bigint NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 15728640), -- 15 MB limit

  -- Versioning
  version int NOT NULL CHECK (version >= 1),
  title text NOT NULL DEFAULT 'Clinical Nutrition Plan',
  calorie_target int CHECK (calorie_target IS NULL OR (calorie_target >= 500 AND calorie_target <= 10000)),
  macro_ratio jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(macro_ratio) = 'object'),

  -- Audit & author
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Client + Version must be globally unique per client
  CONSTRAINT uq_diet_plans_client_version UNIQUE (client_id, version)
);

-- 2. Attach updated_at trigger
DROP TRIGGER IF EXISTS trg_diet_plans_updated_at ON public.diet_plans;
CREATE TRIGGER trg_diet_plans_updated_at
  BEFORE UPDATE ON public.diet_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 3. Race-free function to assign next version for a client
-- Uses transaction-scoped advisory locking on client_id to serialize concurrent uploads
CREATE OR REPLACE FUNCTION public.get_next_diet_plan_version(p_client_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_next_version int;
BEGIN
  -- Validate client existence
  IF NOT EXISTS (SELECT 1 FROM public.clients WHERE id = p_client_id) THEN
    RAISE EXCEPTION 'Client % not found', p_client_id;
  END IF;

  -- Acquire transaction-scoped advisory lock for this client to prevent race conditions
  PERFORM pg_advisory_xact_lock(hashtext(p_client_id::text));

  SELECT COALESCE(MAX(version), 0) + 1 INTO v_next_version
  FROM public.diet_plans
  WHERE client_id = p_client_id;

  RETURN v_next_version;
END;
$$;
