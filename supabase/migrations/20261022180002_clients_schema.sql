-- ==============================================================================
-- Migration: 20261022180002_clients_schema.sql
-- Description: Core patients/clients table, sequence-backed immutable client codes,
--              E.164 phone verification, WhatsApp consent integrity check,
--              and JSONB health data minimization constraints.
-- ==============================================================================

-- 1. Sequence for human-readable sequential client codes (CL-000001)
CREATE SEQUENCE IF NOT EXISTS public.client_code_seq START WITH 1 INCREMENT BY 1;

-- 2. Generator helper for client_code
CREATE OR REPLACE FUNCTION public.generate_client_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 'CL-' || LPAD(nextval('public.client_code_seq')::text, 6, '0');
$$;

-- 3. Clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code text UNIQUE NOT NULL DEFAULT public.generate_client_code(),
  full_name text NOT NULL CHECK (length(trim(full_name)) >= 2),
  phone_e164 text NOT NULL CHECK (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  email text CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  date_of_birth date CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE),
  gender text CHECK (gender IS NULL OR gender IN ('female', 'male', 'non_binary', 'prefer_not_to_say', 'other')),
  
  -- Structured clinical questionnaire and preference data (minimized, strictly validated as objects)
  dietary_preferences jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(dietary_preferences) = 'object'),
  goals jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(goals) = 'object'),
  intake_responses jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(intake_responses) = 'object'),

  -- WhatsApp Opt-in Consent constraint:
  -- Consent is TRUE if and only if whatsapp_consent_at timestamp is explicitly recorded.
  whatsapp_consent boolean NOT NULL DEFAULT false,
  whatsapp_consent_at timestamptz,
  CONSTRAINT chk_whatsapp_consent_consistency CHECK (
    (whatsapp_consent = true AND whatsapp_consent_at IS NOT NULL) OR
    (whatsapp_consent = false AND whatsapp_consent_at IS NULL)
  ),

  -- Intake source and idempotency deduplication reference
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'google_form', 'referral', 'portal')),
  external_ref text,

  -- Authorship and audit timestamps
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Attach updated_at trigger
DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 5. Immutability guard for client_code
CREATE OR REPLACE FUNCTION public.guard_client_code_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.client_code IS DISTINCT FROM NEW.client_code THEN
    RAISE EXCEPTION 'Constraint Violation: client_code is immutable after generation (Original: %, Attempted: %)',
      OLD.client_code, NEW.client_code;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_client_code_immutability ON public.clients;
CREATE TRIGGER trg_guard_client_code_immutability
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_client_code_immutability();

-- 6. Duplicate detection query helper (Documented alternative to strict phone unique index)
-- NOTE: A strict UNIQUE index on phone_e164 is deliberately omitted to accommodate
-- legitimate healthcare shared-family phones (e.g. parent/child, elder/caregiver).
-- Instead, duplicate detection is performed via this dedicated helper function.
CREATE OR REPLACE FUNCTION public.find_potential_duplicate_clients(
  p_phone_e164 text,
  p_email text DEFAULT NULL,
  p_exclude_id uuid DEFAULT NULL
)
RETURNS TABLE (
  client_id uuid,
  client_code text,
  full_name text,
  phone_e164 text,
  email text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    c.id AS client_id,
    c.client_code,
    c.full_name,
    c.phone_e164,
    c.email,
    c.created_at
  FROM public.clients c
  WHERE 
    (c.id IS DISTINCT FROM p_exclude_id)
    AND (
      c.phone_e164 = p_phone_e164
      OR (p_email IS NOT NULL AND c.email IS NOT NULL AND LOWER(c.email) = LOWER(p_email))
    )
  ORDER BY c.created_at DESC;
$$;
