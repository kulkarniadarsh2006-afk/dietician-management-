-- ==============================================================================
-- Migration: 20261022180005_audit_logs_schema.sql
-- Description: Audit logs table, append-only immutability trigger, and
--              sensitive metadata sanitization check.
-- ==============================================================================

-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_table text NOT NULL,
  target_id uuid NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Append-Only Trigger: Block all UPDATE and DELETE statements
CREATE OR REPLACE FUNCTION public.guard_audit_logs_append_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'Security Violation: public.audit_logs is append-only and records cannot be updated or deleted';
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_audit_logs_append_only ON public.audit_logs;
CREATE TRIGGER trg_guard_audit_logs_append_only
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_audit_logs_append_only();

-- 3. Sensitive Data Sanitizer Trigger:
-- Strictly rejects insertions containing PHI or credentials in metadata keys
CREATE OR REPLACE FUNCTION public.guard_audit_logs_non_sensitive_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_prohibited_key text;
  v_prohibited_keys text[] := ARRAY[
    'name', 'full_name', 'phone', 'phone_e164', 'email', 'intake',
    'intake_responses', 'signed_url', 'url', 'token', 'access_token',
    'secret', 'password', 'file_contents', 'content', 'medical_conditions'
  ];
BEGIN
  FOREACH v_prohibited_key IN ARRAY v_prohibited_keys LOOP
    IF NEW.metadata ? v_prohibited_key THEN
      RAISE EXCEPTION 'Security Violation: audit_logs metadata contains prohibited sensitive key "%"',
        v_prohibited_key;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_audit_logs_non_sensitive_metadata ON public.audit_logs;
CREATE TRIGGER trg_guard_audit_logs_non_sensitive_metadata
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_audit_logs_non_sensitive_metadata();
